from typing import Any
from typing import Optional
from typing import Tuple
from typing import List
from typing import Dict
import sys
import datetime
import os
import sqlite3
import aiosqlite
import json
from oakvar import BaseReporter
from oakvar.util.util import detect_encoding


class Reporter(BaseReporter):

    # Replacement of % must come first
    perc_encode = [
        [r"%", r"%25"],
        [r":", r"%3A"],
        [r";", r"%3B"],
        [r"=", r"%3D"],
        [r",", r"%2C"],
        [r"\n", r"%0A"],
        [r"\t", r"%09"],
        [r"\r", r"%0D"],
        [r" ", r"%20"],
    ]
    COL_NAMES_TO_SKIP = {
        "base__chrom",
        "base__pos",
        "base__ref_base",
        "base__alt_base",
    }
    INFO_PREFIX = "OV"
    NO_SAMPLE_HEADER = "CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO"
    SAMPLE_HEADER = "CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t"

    def __init__(self, args):
        super().__init__(args)
        self.cursor2 = None
        self.conn2 = None
        self.wf = None
        self.filename = None
        self.filename_prefix = None
        self.vcf_files = {}
        self.vcf_line: Dict[int, str] = {}
        self.line_no: Dict[int, int] = {}

    def vcf_encode(self, orig):
        new = orig
        if type(new) == str:
            for k, v in self.perc_encode:
                new = new.replace(k, v)
        return new

    def vcf_decode(self, orig):
        new = orig
        for k, v in self.perc_encode[::-1]:
            new = new.replace(v, k)
        return new

    def set_output_filename(self):
        if self.savepath == None:
            self.filename_prefix = "oakvar_result"
        else:
            self.filename_prefix = self.savepath
        self.filename = self.filename_prefix + ".vcf"

    def set_info_type(self):
        if not "type" in self.module_options:
            self.info_type = "separate"
        else:
            info_type = self.module_options["type"]
            if info_type in ["separate", "combined"]:
                self.info_type = self.module_options["type"]
            else:
                self.info_type = "combined"

    def set_input_format(self):
        if not self.cursor2:
            raise
        q = 'select colval from info where colkey="converter_format"'
        self.cursor2.execute(q)
        r = self.cursor2.fetchone()
        if not r:
            return False
        self.input_format = json.loads(r[0])
        return True

    def guard_against_multiple_vcf_inputs(self):
        if self.vcf_format and self.input_paths and len(self.input_paths) > 1:
            msg = "VCF reporter can handle jobs with only 1 VCF input file"
            if self.logger:
                self.logger.info(msg)
            print(msg)
            if self.filename:
                wf = open(self.filename, "w")
                wf.write(msg + "\n")
                wf.close()
            return False
        else:
            return True

    def setup(self):
        from oakvar.exceptions import SetupError

        if not self.cursor2 or not self.conn2 or not self.args or not self.logger:
            raise
        self.input_paths: List[str] = []
        self.levels_to_write = ["variant"]
        self.set_output_filename()
        self.set_info_type()
        if not self.set_input_format():
            raise SetupError(msg="input format does not exist in info table of the input database.")
        self.input_paths = self.get_input_paths_from_db()
        self.vcf_format = "vcf" in self.input_format
        ret = self.guard_against_multiple_vcf_inputs()
        return ret

    def end(self):
        if self.wf is not None:
            self.wf.close()
        return self.filename

    async def connect_db(self, dbpath=None):
        if dbpath != None:
            self.dbpath = dbpath
        if self.dbpath == None:
            sys.stderr.write("Provide a path to aggregator output")
            exit()
        if os.path.exists(self.dbpath) == False:
            sys.stderr.write(self.dbpath + " does not exist.")
            exit()
        self.conn = await aiosqlite.connect(self.dbpath)
        self.cursor = await self.conn.cursor()
        self.conn2 = sqlite3.connect(self.dbpath)
        self.cursor2 = self.conn2.cursor()

    async def close_db(self):
        if self.cursor2:
            self.cursor2.close()
        if self.conn2:
            self.conn2.close()
        await self.cursor.close()
        await self.conn.close()
        if self.cf:
            await self.cf.close_db()

    def get_input_paths_from_db(self) -> List[str]:
        import json

        if not self.cursor2:
            return []
        q = "select colval from info where colkey='inputs'"
        self.cursor2.execute(q)
        ret = self.cursor2.fetchone()
        if not ret:
            return []
        inputs = json.loads(ret[0])
        return inputs

    def change_colnames_nos_to_display_according_to_base_samples(self, level: str):
        if "base__samples" not in self.colnames_to_display[level]:
            newcolnames_to_display = []
            newcolnos_to_display = []
            cols = self.colinfo[level]["columns"]
            for i in range(len(cols)):
                col = cols[i]
                colname = col["col_name"]
                if colname in self.colnames_to_display[level]:
                    newcolnames_to_display.append(colname)
                    newcolnos_to_display.append(i)
                elif colname == "base__samples":
                    newcolnames_to_display.append(colname)
                    newcolnos_to_display.append(i)
            self.colnames_to_display[level] = newcolnames_to_display
            self.colnos_to_display[level] = newcolnos_to_display

    def can_use_input_file_in_output(self):
        return self.vcf_format and len(self.input_paths) == 1

    def get_gt_pos(self, s):
        words = s.split(":")
        if "GT" in words:
            return words.index("GT")
        else:
            return None

    def transfer_preface_from_input(self):
        import gzip

        if not self.wf:
            raise
        input_path_dict = {}
        for i in range(len(self.input_paths)):
            input_path_dict[self.input_paths[i]] = i
        written_headers = []
        self.samples = []
        num_inputfiles = len(self.input_paths)
        for inputfile in self.input_paths:
            inputfile_prefix = os.path.basename(inputfile).split(".")[0]
            input_path_no = input_path_dict[inputfile]
            encoding = detect_encoding(inputfile)
            if inputfile.endswith(".gz"):
                f = gzip.open(inputfile, "rt", encoding=encoding)
            else:
                f = open(inputfile, encoding=encoding)
            line_no = 0
            self.vcf_files[input_path_no] = f
            for line in f:
                line_no += 1
                if line.startswith("##fileformat="):
                    continue
                if line.startswith("##"):
                    if not line in written_headers:
                        self.wf.write(line)
                        written_headers.append(line)
                elif line.startswith("#CHROM"):
                    toks = line[:-1].split("\t")
                    if len(toks) >= 10:
                        if num_inputfiles == 1:
                            self.samples.extend([v for v in toks[9:]])
                        else:
                            self.samples.extend(
                                [inputfile_prefix + "_" + v for v in toks[9:]]
                            )
                    self.line_no[input_path_no] = line_no
                    break

    def make_samples(self):
        if not self.cursor2:
            raise
        self.cursor2.execute("select distinct(base__sample_id) from sample")
        self.samples = []
        rows = self.cursor2.fetchall()
        if rows is None or len(rows) == 0:
            self.samples.append("NOSAMPLEID")
        else:
            for row in rows:
                v = row[0]
                if v is None:
                    v = "NOSAMPLEID"
                self.samples.append(v)

    def write_preface(self, level):
        if not self.cursor2 or not self.conn2 or not self.filename or not self.args or not self.input_paths:
            raise
        self.level = level
        if level != "variant":
            return
        self.change_colnames_nos_to_display_according_to_base_samples(level)
        self.extracted_cols[level] = self.get_extracted_header_columns(level)
        if self.wf:
            self.wf.close()
        self.wf = open(self.filename, "w", encoding="utf-8", newline="")
        lines = [
            "#fileformat=VCFv4.2",
            "#OakVarFileDate=" + datetime.datetime.now().strftime("%Y%m%d"),
        ]
        self.write_preface_lines(lines)
        self.vcf_files = {}
        if self.can_use_input_file_in_output():
            self.transfer_preface_from_input()
        else:
            self.make_samples()

    def oc2vcf_key(self, col_name):
        return f"{self.INFO_PREFIX}_{col_name}"

    def include_column(self, col_name):
        if col_name in self.COL_NAMES_TO_SKIP:
            return False
        if col_name.startswith("extra_vcf_info__"):
            return False
        if col_name.startswith("vcfinfo__"):
            return False
        if col_name.startswith("tagsampler__"):
            return False
        if col_name.endswith("__original_line"):
            return False
        return True

    def write_header_separate(self, level: str):
        for column in self.extracted_cols[level]:
            # for column in self.colinfo[self.level]['columns']:
            col_name = column["col_name"]
            col_type = column["col_type"].capitalize()
            col_desc = column["col_desc"]
            if not self.include_column(col_name):
                continue
            if col_desc is None:
                col_desc = ""
            if col_type == "Int":
                col_type = "Integer"
            line = '#INFO=<ID={},Number=A,Type={},Description="{}">'.format(
                self.oc2vcf_key(col_name), col_type, col_desc
            )
            self.write_preface_line(line)
            self.col_names.append(col_name)
        if len(self.samples) == 0:
            line = self.NO_SAMPLE_HEADER
        else:
            line = self.SAMPLE_HEADER
            line += "\t".join(self.samples)
        self.write_preface_line(line)

    def write_header_combined(self, level: str):
        line = '#INFO=<ID={},Number=.,Type=String,Description="OakVar annotation. Format: '.format(
            self.INFO_PREFIX
        )
        columns_to_add = []
        desc = []
        for column in self.extracted_cols[level]:
            # for column in self.colinfo[self.level]['columns']:
            col_name = column["col_name"]
            col_desc = column["col_desc"]
            if not (self.include_column(col_name)):
                continue
            columns_to_add.append(col_name)
            if col_desc is not None:
                desc.append(col_name + "=" + col_desc)
            self.col_names.append(col_name)
        line += "|".join(columns_to_add)
        line += " Explanation: {}".format("|".join(desc))
        line += '">'
        self.write_preface_line(line)
        if len(self.samples) == 0:
            line = self.NO_SAMPLE_HEADER
        else:
            line = self.SAMPLE_HEADER
            line += "\t".join(self.samples)
        self.write_preface_line(line)

    def write_header(self, level: str):
        self.level = level
        if self.level != "variant":
            return
        self.output_candidate = {}
        self.col_names = []
        if self.info_type == "separate":
            self.write_header_separate(level)
        elif self.info_type == "combined":
            self.write_header_combined(level)

    def is_valid_alt(self, alt: str):
        return alt != "*" and alt != "<*>" and alt != "<NON_REF>"

    def get_alts_from_vcf_line(self, line):
        return line.split("\t")[4].split(",")

    def forward_f_to_get_vcf_line(self, input_path_no: int, line_no: int):
        if line_no == self.line_no[input_path_no]:
            return
        f = self.vcf_files[input_path_no]
        while self.line_no[input_path_no] < line_no:
            self.vcf_line[input_path_no] = f.readline()[:-1]
            self.line_no[input_path_no] += 1

    def valid_and_in_sample(self, alts: List[str], input_path_no: int):
        alts_valid = [self.is_valid_alt(alt) for alt in alts]
        alts_in_sample = self.get_alts_present_in_samples(alts, input_path_no)
        return [alts_valid[i] and alts_in_sample[i] for i in range(len(alts))]

    def get_alts_present_in_samples(self, alts: List[str], input_path_no: int):
        words = self.vcf_line[input_path_no].split("\t")
        if len(words) >= 10:
            gt_pos = self.get_gt_pos(words[8])
            if gt_pos is not None:
                alts_in_sample = [False] * len(alts)
                for sample_data in words[9:]:
                    gts_s: str = sample_data.split(":")[gt_pos]
                    if "|" in gts_s:
                        gts = gts_s.split("|")
                    elif "/" in gts_s:
                        gts = gts_s.split("/")
                    else:
                        continue
                    for gt in gts:
                        if not gt in [".", "0"]:
                            alts_in_sample[int(gt) - 1] = True
                return alts_in_sample
            else:
                return [False] * len(alts)
        else:
            return [True] * len(alts)



    def make_output_candidate(self, uid) -> int:
        if not self.cursor2:
            raise
        q = "select base__fileno, base__original_line from mapping where base__uid=?"
        self.cursor2.execute(q, (uid,))
        ret = self.cursor2.fetchone()
        if not ret:
            if self.logger:
                self.logger.error(f"variant {uid} does not exist in the result database.")
            raise
        (input_path_no, line_no) = ret
        if not self.vcf_format or line_no == self.line_no[input_path_no]:
            return input_path_no
        self.forward_f_to_get_vcf_line(input_path_no, line_no)
        self.output_candidate[input_path_no] = {}
        alts = self.get_alts_from_vcf_line(self.vcf_line[input_path_no])
        noalts = len(alts)
        alts_valid_in_sample = self.valid_and_in_sample(alts, input_path_no)
        noalts_valid_in_sample = sum([1 if flag else 0 for flag in alts_valid_in_sample])
        self.output_candidate[input_path_no] = {
            "noalts": noalts,
            "noalts_valid_in_sample": noalts_valid_in_sample,
            "alts_valid_in_sample": alts_valid_in_sample,
            "alts": alts,
            "annots": [],
        }
        return input_path_no

    def get_parsed_row(self, columns: list, row: list) -> Tuple[List[str], List[str], Optional[Any], Optional[Any], Optional[Any], Optional[Any], Optional[Any], Optional[int]]:
        if not self.cursor2:
            raise
        chrom = None
        pos = None
        uid = None
        ref = None
        alt = None
        input_path_no = None
        info: List[str] = []
        sample_cols: List[str] = []
        for i in range(len(columns)):
            column = columns[i]
            col_name = column["col_name"]
            cell = row[i]
            if col_name == "base__uid":
                uid = cell
                input_path_no = self.make_output_candidate(uid)
            elif col_name == "base__all_mappings":
                cell = cell.replace(" ", "-")
            if self.vcf_format and not (self.include_column(col_name)):
                continue
            if cell is None:
                infocell = ""
            elif type(cell) is str:
                try:
                    o = json.loads(cell)
                    if type(o) in (dict, list):
                        if len(o) == 0:
                            infocell = ""
                        jsoncell = json.dumps(o, separators=(",", ":"))
                        infocell = self.vcf_encode(jsoncell)
                    else:
                        infocell = self.vcf_encode(cell)
                except json.JSONDecodeError:
                    infocell = self.vcf_encode(cell)
            else:
                infocell = str(cell)
            if not self.vcf_format:
                if col_name == "base__chrom":
                    chrom = cell.lstrip("chr")
                    continue
                elif col_name == "base__pos":
                    pos = cell
                    continue
                elif col_name == "base__ref_base":
                    ref = cell
                    continue
                elif col_name == "base__alt_base":
                    alt = cell
                    continue
                elif col_name in ["tagsampler__samples", "base__samples"]: # TODO: "base__samples" is legacy. Delete after a while. 11/20/2022.
                    if cell:
                        samples_with_variant = cell.split(",")
                        for s in self.samples:
                            if s in samples_with_variant:
                                sample_cols.append("1|1")
                            else:
                                sample_cols.append(".|.")
            info.append(infocell)
        return info, sample_cols, uid, chrom, pos, ref, alt, input_path_no

    def has_value(self, value):
        return value not in ["", "\"\"", "."]

    def write_table_row(self, row):
        if self.level != "variant":
            return
        if not self.cursor2 or not self.conn2:
            raise
        columns = self.extracted_cols[self.level]
        row = list(row)
        writerow = []
        info, sample_cols, uid, chrom, pos, ref, alt, input_path_no = self.get_parsed_row(columns, row)
        if input_path_no is None:
            raise
        out = {}
        info_add_str = ""
        if self.vcf_format:
            out = self.output_candidate[input_path_no]
            noalts = out["noalts"]
            noalts_valid_in_sample = out["noalts_valid_in_sample"]
            alts_valid_in_sample = out["alts_valid_in_sample"]
            annots = out["annots"]
        else:
            if not alt:
                raise
            noalts = 1
            noalts_valid_in_sample = 1
            alts_valid_in_sample = [True]
            annots = []
        annots.append(info)
        if len(annots) != noalts_valid_in_sample:
            return
        numfields = len(annots[0])
        combined_annots = [["." for _ in range(noalts)] for _ in range(numfields)]
        for fieldno in range(len(annots[0])):
            star_offset = 0
            for altno in range(noalts):
                if not alts_valid_in_sample[altno]:
                    star_offset += 1
                else:
                    combined_annots[fieldno][altno] = annots[altno - star_offset][
                        fieldno
                    ]
        if self.info_type == "separate":
            info_add_list = []
            for colno in range(len(self.col_names)):
                vals = combined_annots[colno]
                has_value = False
                for val in vals:
                    if self.has_value(val):
                        has_value = True
                        break
                if has_value:
                    info_add_list.append(
                        self.oc2vcf_key(self.col_names[colno])
                        + "="
                        + ",".join(combined_annots[colno])
                    )
            info_add_str = ";".join(info_add_list)
        elif self.info_type == "combined":
            info_add_str = (
                self.INFO_PREFIX
                + "="
                + "|".join([",".join(altlist) for altlist in combined_annots])
            )
        if self.vcf_format:
            words = self.vcf_line[input_path_no].split("\t")
            if words[7] == "." or words[7] == "":
                words[7] = info_add_str
            else:
                words[7] = words[7] + ";" + info_add_str
            writerow = words
        else:
            writerow = [
                str(chrom),
                str(pos),
                str(uid),
                ref,
                alt,
                ".",
                ".",
                info_add_str,
                "GT",
            ]
            writerow.extend(sample_cols)
        self.write_body_line(writerow)

    def write_body_line(self, row):
        if self.level != "variant":
            return
        if self.wf:
            self.wf.write("\t".join(row) + "\n")

    def write_preface_lines(self, lines):
        if self.level != "variant":
            return
        for line in lines:
            self.write_preface_line(line)

    def write_preface_line(self, line):
        if self.level != "variant":
            return
        if self.wf:
            self.wf.write("#" + line + "\n")


def main():
    reporter = Reporter(sys.argv)
    reporter.run()


if __name__ == "__main__":
    main()
