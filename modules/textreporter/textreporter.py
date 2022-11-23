from oakvar import BaseReporter
import sys
import datetime


class Reporter(BaseReporter):
    def setup(self):
        if self.savepath == None:
            self.savepath = "cravat_result.tsv"
        else:
            if self.savepath[-5:] != ".tsv":
                self.savepath = self.savepath + ".tsv"
        self.wf = open(self.savepath, "w", encoding="utf-8")
        self.levels_to_write = self.get_standardized_module_option(
            self.confs.get("pages", "variant,gene,sample,mapping")
        )

    def end(self):
        self.wf.close()
        return self.savepath

    def should_write_level(self, level):
        if self.levels_to_write is None:
            return True
        elif level in self.levels_to_write:
            return True
        else:
            return False

    def write_preface(self, level):
        self.level = level
        lines = [
            "OakVar Report",
            "Created at " + datetime.datetime.now().strftime("%A %m/%d/%Y %X"),
            "Report level: " + level,
            "",
        ]
        self.write_preface_lines(lines)

    def write_header(self, level):
        line = ""
        for colgroup in self.colinfo[level]["colgroups"]:
            count = colgroup["count"]
            if count == 0:
                continue
            count = 0
            colgrp_name = colgroup["name"]
            for col in self.colinfo[level]["columns"]:
                module_col_name = col["col_name"]
                [module_name, col_name] = module_col_name.split("__")
                incl = False
                if module_name == colgrp_name:
                    if self.display_select_columns[level]:
                        if module_col_name in self.colnames_to_display[level]:
                            incl = True
                    else:
                        incl = True
                if incl:
                    count += 1
            if count > 0:
                line += colgroup["displayname"]
                for _ in range(count):
                    line += "\t"
        if len(line) > 0:
            if line[-1] == "\t":
                line = line[:-1]
            self.write_body_line(line)
            coltitles = [
                column["col_title"]
                for column in self.colinfo[level]["columns"]
                if column["col_name"] in self.colnames_to_display[level]
            ]
            self.write_body_line("\t".join(coltitles))

    def write_table_row(self, row):
        self.write_body_line(
            "\t".join([str(v) if v != None else "" for v in list(row)])
        )

    def write_body_line(self, line):
        self.wf.write(line + "\n")

    def write_preface_lines(self, lines):
        for line in lines:
            self.write_preface_line(line)

    def write_preface_line(self, line):
        self.wf.write("#" + line + "\n")


def main():
    reporter = Reporter(sys.argv)
    reporter.run()


if __name__ == "__main__":
    main()
