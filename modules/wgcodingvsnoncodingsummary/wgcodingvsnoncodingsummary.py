import aiosqlite

async def get_data (queries):
    dbpath = queries['dbpath']
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()
    no_coding = 0
    no_noncoding = 0
    query = f"select name from sqlite_master where type='table' and name='variant_filtered'"
    await cursor.execute(query)
    r = await cursor.fetchone()
    if r:
        filtered = True
    else:
        filtered = False
    if filtered:
        q = "select count(*) from variant as v, variant_filtered as f where v.base__uid=f.base__uid"
    else:
        q = "select count(*) from variant as v"
    await cursor.execute(q)
    ret = await cursor.fetchone()
    if ret:
        no_total = ret[0]
    else:
        no_total = 0
    where = "v.base__so='TAB' or v.base__so='EXL' or v.base__so='MLO' or v.base__so='IND' or v.base__so='INI' or v.base__so='FSD' or v.base__so='FSI' or v.base__so='STG' or v.base__so='SPL' or v.base__so='STL' or v.base__so='CSS' or v.base__so='MIS'"
    if filtered:
        q += f" and ({where})"
    else:
        q += f" where {where}"
    await cursor.execute(q)
    ret = await cursor.fetchone()
    if ret:
        no_noncoding = ret[0]
    else:
        no_noncoding = 0
    no_coding = no_total - no_noncoding
    response = {'data': {'no_coding': no_coding, 'no_noncoding': no_noncoding}}
    await cursor.close()
    await conn.close()
    return response

