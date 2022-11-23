from oakvar import BasePostAggregator

CASE_CONTROL_FILE_KEY = "cc_file"

class PostAggregator (BasePostAggregator):

    def check(self):
        if not self.module_options:
            return False
        return CASE_CONTROL_FILE_KEY in self.module_options

    def setup (self):
        from pathlib import Path
        from collections import defaultdict
        from oakvar.exceptions import ModuleLoadingError
        from oakvar.util.run import update_status

        if not self.conf or not self.module_options or not self.dbconn:
            raise ModuleLoadingError(self.module_name)
        self.cursor_samples = self.dbconn.cursor()
        q = 'select distinct base__sample_id from sample'
        self.cursor_samples.execute(q)
        self.all_samples = {r[0] for r in self.cursor_samples}
        self.casecontrol = defaultdict(set)
        cc_file_path = Path(self.module_options.get(CASE_CONTROL_FILE_KEY, "")).expanduser().resolve()
        with cc_file_path.open() as f:
            for l in f:
                toks = l.strip().split()
                self.casecontrol[toks[1]].add(toks[0])
        self.case_samples = self.all_samples & self.casecontrol['case']
        self.cont_samples = self.all_samples & self.casecontrol['control']
        notfound_case = len(self.casecontrol['case'] - self.all_samples)
        notfound_cont = len(self.casecontrol['control'] - self.all_samples)
        if (notfound_case + notfound_cont) > 0:
            if self.conf:
                msg = f'WARNING: Some {self.conf["title"]} samples were not found in the job. {notfound_case} case and {notfound_cont} control'
                update_status(msg, logger=self.logger)
        q = 'pragma table_info(sample);'
        self.cursor_samples.execute(q)
        samp_cols = {r[1] for r in self.cursor_samples}
        self.has_zygosity = 'base__zygosity' in samp_cols
        self.qt_samples_plain = 'select base__sample_id from sample where base__uid=?'
        self.qt_samples_zyg = 'select base__sample_id, base__zygosity from sample where base__uid=?'

        # Flag multi-allelic sites
        self.multiallelic_uids = set()
        q = 'select group_concat(base__uid) as uids, count(base__uid) as uid_count from mapping group by base__original_line having uid_count > 1;'
        for row in self.dbconn.execute(q):
            self.multiallelic_uids.update((int(x) for x in row[0].split(',')))
    
    def annotate (self, input_data):
        from scipy.stats import fisher_exact

        uid = input_data['base__uid']
        if self.has_zygosity:
            hom_samples = set()
            het_samples = set()
            self.cursor_samples.execute(self.qt_samples_zyg,(uid,))
            for sid, zyg in self.cursor_samples:
                if zyg=='hom':
                    hom_samples.add(sid)
                elif zyg=='het':
                    het_samples.add(sid)                
        else:
            self.cursor_samples.execute(self.qt_samples_plain,(uid,))
            hom_samples = {r[0] for r in self.cursor_samples}
            het_samples = set()
        hom_case = len(self.case_samples & hom_samples)
        het_case = len(self.case_samples & het_samples)
        ref_case = len(self.case_samples) - hom_case - het_case
        hom_cont = len(self.cont_samples & hom_samples)
        het_cont = len(self.cont_samples & het_samples)
        ref_cont = len(self.cont_samples) - hom_cont - het_cont
        dom_table = [
            [hom_case + het_case, ref_case],
            [hom_cont + het_cont, ref_cont]
        ]
        dom_pvalue = fisher_exact(dom_table,'greater')[1]
        rec_table = [
            [hom_case, ref_case + het_case],
            [hom_cont, ref_cont + het_cont]
        ]
        rec_pvalue = fisher_exact(rec_table,'greater')[1]
        all_table = [
            [2*hom_case + het_case, 2*ref_case + het_case],
            [2*hom_cont + het_cont, 2*ref_cont + het_cont]
        ]
        all_pvalue = fisher_exact(all_table,'greater')[1]
        multiallelic = 'Y' if uid in self.multiallelic_uids else None
        return {
            'dom_pvalue': dom_pvalue,
            'rec_pvalue': rec_pvalue,
            'all_pvalue': all_pvalue,
            'hom_case': hom_case,
            'het_case': het_case,
            'ref_case': ref_case,
            'hom_cont': hom_cont,
            'het_cont': het_cont,
            'ref_cont': ref_cont,
            'multiallelic': multiallelic,
        }

