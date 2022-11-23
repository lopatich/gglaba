from oakvar import BasePostAggregator

class PostAggregator (BasePostAggregator):

    def check(self):
        import json

        if not self.cursor:
            return
        self.cursor.execute('select col_name from sample_header where col_name="base__zygosity"')
        has_zygosity = self.cursor.fetchone() is not None
        self.cursor.execute('select colval from info where colkey="converter_format"')
        ret = self.cursor.fetchone()
        if not ret:
            return False
        converter_format = json.loads(ret[0])
        return has_zygosity and not "vcf" in converter_format

    def setup (self):
        pass
    
    def cleanup (self):
        pass
        
    def annotate (self, input_data):
        if not self.cursor:
            return
        uid = str(input_data['base__uid'])
        q = 'select base__zygosity from sample where base__uid=?'
        self.cursor.execute(q,(uid,))
        out = {'zygosity': ';'.join([r[0] for r in self.cursor])}
        return out

