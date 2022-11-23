import aiosqlite

async def get_data (queries):
    ret = {}
    try:
        dbpath = queries['dbpath']
        tab = queries['tab']
        rowkey = queries['rowkey']
        note = queries['note'].replace('"', "'")
        conn = await aiosqlite.connect(dbpath)
        c = await conn.cursor()
        if tab == 'variant':
            q = 'update {} set base__note="{}" where base__uid={}'.format(
                tab, note, rowkey)
            await c.execute(q)
        elif tab == 'gene':
            q = 'update {} set base__note="{}" where base__hugo="{}"'.format(
                tab, note, rowkey)
            await c.execute(q)
        await conn.commit()
        ret['status'] = 'success'
    except:
        import traceback
        traceback.print_exc()
        ret['status'] = 'fail'
    await c.close()
    await conn.close()
    return ret
