import sys
from oakvar import BasePostAggregator

class PostAggregator (BasePostAggregator):

    def check(self):
        import json

        if not self.cursor:
            return False
        self.cursor.execute('select colval from info where colkey="converter_format"')
        ret = self.cursor.fetchone()
        if not ret:
            return False
        converter_format = json.loads(ret[0])
        return "vcf" in converter_format

    def setup (self):
        pass
    
    def annotate (self, input_data):
        if not self.cursor:
            return
        uid = str(input_data['base__uid'])
        q = "select base__phred, base__filter, base__zygosity, base__alt_reads, base__tot_reads, base__af, base__hap_block, base__hap_strand from sample where base__uid=?"
        self.cursor.execute(q, (uid,))
        phreds = []
        filts = []
        zygosities = []
        altreads = []
        totreads = []
        afs = []
        hap_blocks = []
        hap_strands = []
        for row in self.cursor.fetchall():
            (phred, filt, zygosity, altread, totread, af, hap_block, hap_strand) = row
            phreds.append(phred)
            filts.append(filt)
            zygosities.append(zygosity)
            altreads.append(altread)
            totreads.append(totread)
            afs.append(af)
            hap_blocks.append(hap_block)
            hap_strands.append(hap_strand)
        phred = ';'.join(['' if v == None else str(v) for v in phreds])
        s = list(set(phred))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            phred = None
        filter = ';'.join(['' if v == None else str(v) for v in filts])
        s = list(set(filter))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            filter = None
        zygosity = ';'.join(['' if v == None else str(v) for v in zygosities])
        s = list(set(zygosity))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            zygosity = None
        alt_reads = ';'.join(['' if v == None else str(v) for v in altreads])
        s = list(set(alt_reads))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            alt_reads = None
        tot_reads = ';'.join(['' if v == None else str(v) for v in totreads])
        s = list(set(tot_reads))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            tot_reads = None
        af = ';'.join(['' if v == None else str(v) for v in afs])
        s = list(set(af))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            af = None
        hap_block = ';'.join(['' if v == None else str(v) for v in hap_blocks])
        s = list(set(hap_block))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            hap_block = None
        hap_strand = ';'.join(['' if v == None else str(v) for v in hap_strands])
        s = list(set(hap_strand))
        if len(s) == 0 or (len(s) == 1 and s[0] == ';'):
            hap_strand = None
        out = {'phred': phred, 'filter': filter, 'zygosity': zygosity, 
               'alt_reads': alt_reads, 'tot_reads': tot_reads, 'af': af,
               'hap_block': hap_block, 'hap_strand': hap_strand,}
        return out
