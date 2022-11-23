import aiosqlite
import os

async def make_db ():
    dbpath = 'wglollipop.sqlite'
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()
    table_name = 'variant'
    sql = 'drop table if exists ' + table_name
    await cursor.execute(sql)
    sql = 'create table ' + table_name + ' (' +\
        'tissue text, hugo text, cravat_transcript text, ref_aa text, ' +\
        'alt_aa text, aa_pos integer, so text, num_sample integer)'
    await cursor.execute(sql)
    table_name = 'protein'
    sql = 'drop table if exists ' + table_name
    await cursor.execute(sql)
    sql = 'create table ' + table_name + ' (chrom text, feature_key text, ' +\
        'desc text, start integer, stop integer, uniprot_id text, ' +\
        'aa_len integer, cravat_transcript text, shrt_desc text, ' +\
        'hugo text, data_source text)'
    await cursor.execute(sql)
    sql = 'create index ' + table_name + '_idx0 on ' + table_name + ' (hugo)'
    await cursor.execute(sql)
    await cursor.close()
    await conn.close()
    
    # Next steps.
    # .separator "\t"
    # .import variant.txt variant
    # .import protein.txt protein
    # alter table variant add column data_source text;
    # update variant set data_source='TCGA';
    # update protein set data_source='uniprot' where data_source='Uniprot';
    # update protein set data_source='pfam' where data_source='Pfam';

async def get_data (queries):
    hugo = queries['hugo']
    dbpath = os.path.join(os.path.dirname(__file__), 'data',
                          'wglollipop.sqlite')
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()
    
    ret = {}
    ret['transcripts'] = []

    # Domains
    feature_keys_ignore = [
        'topological domain',
        'modified residue',
        'compositionally biased region',
        'initiator methionine',
        'chain',
        'propeptide',
        'transit peptide',
        'peptide',
        'coiled-coil',
        'disordered']
    sql = 'select desc, start, stop, aa_len, cravat_transcript, ' +\
        'shrt_desc, data_source, feature_key from protein where hugo="' +\
        hugo + '" and feature_key not in (' +\
        ', '.join(['"' + v + '"' for v in feature_keys_ignore]) + ')'
    await cursor.execute(sql)
    domains = {}
    for row in await cursor.fetchall():
        (desc, start, stop, aalen, cravat_transcript, \
            shrt_desc, data_source, feature_key) = row
        if cravat_transcript not in ret['transcripts']:
            ret['transcripts'].append(cravat_transcript)
        if data_source not in domains:
            domains[data_source] = []
        ret['len'] = aalen
        row = {'start': start, 'stop': stop, 'desc': desc, 
            'shrt_desc': shrt_desc, 'data_source': data_source,
            'feature_key': feature_key}
        if row not in domains[data_source]:
            domains[data_source].append(row)
    for data_source in domains:
        domains[data_source] = \
            sorted(domains[data_source], key=lambda x: x['start'])
    ret['domains'] = domains
    # Variants
    sql = 'select tissue, cravat_transcript, aa_pos, ref_aa, alt_aa, ' +\
        'so, num_sample, data_source from variant where hugo="' + hugo + '"'
    await cursor.execute(sql)
    variants = {}
    for row in await cursor.fetchall():
        (tissue, cravat_transcript, aa_pos, ref_aa, alt_aa, 
            so, num_sample, data_source) = row
        if cravat_transcript not in ret['transcripts']:
            continue
        if data_source not in variants:
            variants[data_source] = {}
        if tissue not in variants[data_source]:
            variants[data_source][tissue] = []
        variants[data_source][tissue].append({
            'start': aa_pos, 
            'refaa': ref_aa, 
            'altaa': alt_aa, 
            'so': so, 
            'num_sample': num_sample})
    for data_source in variants:
        for tissue in variants[data_source]:
            l = variants[data_source][tissue]
            l = sorted(l, key=lambda x: x['start'])
            variants[data_source][tissue] = l
    ret['variants'] = variants
    ret['hugo'] = hugo
    await cursor.close()
    await conn.close()
    return ret
