from oakvar import BasePostAggregator

class CravatPostAggregator (BasePostAggregator):

    def check(self):
        return True

    def setup (self):
        if not self.cursor or not self.dbconn:
            return
        q = 'select distinct(base__sample_id) from sample'
        self.cursor.execute(q)
        sample_is_all_null = True
        for r in self.cursor:
            if r[0] is not None:
                sample_is_all_null = False
                break
        if sample_is_all_null == False:
            q = 'update sample set base__sample_id="no-sample" where base__sample_id is null'
            self.cursor.execute(q)
            self.dbconn.commit()
        try:
            q = "select base__genotype from sample limit 1"
            self.cursor.execute(q)
            self.genotype_present = True
        except:
            self.genotype_present = False
        self.cursor.execute('pragma synchronous=0;')
        self.cursor.execute('pragma journal_mode=WAL;')
    
    def cleanup (self):
        if not self.cursor or not self.dbconn:
            return
        self.cursor.execute('pragma synchronous=2;')
        self.cursor.execute('pragma journal_mode=delete;')
        
    def annotate (self, input_data):
        if not self.cursor or not self.dbconn:
            return
        uid = str(input_data['base__uid'])
        q = f"select base__sample_id from sample where base__uid=? and base__sample_id is not null"
        self.cursor.execute(q, (uid,))
        samples = [v[0] for v in self.cursor.fetchall() if v[0]]
        numsample = len(samples)
        samples = ','.join(samples)
        q = f"select base__tags from mapping where base__uid=?"
        self.cursor.execute(q, (uid,))
        tags = [v[0] for v in self.cursor.fetchall() if v[0]]
        tags = ','.join(tags)
        if self.genotype_present:
            q = "select base__genotype from sample where base__uid=? and base__sample_id is not null"
            self.cursor.execute(q, (uid,))
            genotypes = [v[0] for v in self.cursor.fetchall()]
            genotypes = ",".join(genotypes)
        else:
            genotypes = ""
        out = {'numsample': numsample, 'samples': samples, 'tags': tags, "genotypes": genotypes}
        return out
