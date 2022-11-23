import aiosqlite

async def get_data (queries):
    response = {}
    dbpath = queries['dbpath']
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()
    q = f"select name from sqlite_master where name='variant_filtered'"
    await cursor.execute(q)
    ret = await cursor.fetchone()
    if ret:
        q = f"select v.base__so from variant as v, variant_filtered as f where v.base__uid==f.base__uid"
    else:
        q = f"select base__so from variant"
    await cursor.execute(q)
    rows = await cursor.fetchall()
    counts = {}
    for row in rows:
        so = row[0]
        if so not in counts:
            counts[so] = 0
        counts[so] += 1
    response['data'] = counts
    await cursor.close()
    await conn.close()
    return response

