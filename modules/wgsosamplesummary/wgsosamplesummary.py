from typing import Any
from typing import Optional

async def run_filter(cf, q=None, cursor_read=Any, cursor_write=Any) -> Optional[Any]:
    _ = cursor_write
    _ = cf
    if not q:
        return
    await cursor_read.execute(q)
    ret = await cursor_read.fetchall()
    return ret

async def get_data (queries):
    from oakvar import ReportFilter
    from json import loads

    dbpath = queries['dbpath']
    ftable_uid = queries["ftable_uid"]
    user = queries["username"]
    cf = await ReportFilter.create(dbpath=dbpath, user=user, uid=ftable_uid)
    ftable_name = cf.get_ftable_name(uid=ftable_uid, ftype="variant")
    if not ftable_name:
        ftable_name = f"main.variant"
    q = f"select distinct v.base__sample_id from {ftable_name} as f, main.sample as v where f.base__uid==v.base__uid"
    ret = await cf.exec_db(run_filter, cf, q=q)
    if ret is None:
        ret = []
    samples = [v[0] for v in ret if v[0]]
    if len(samples) == 1:
        await cf.close_db()
        response = {'data': None}
        return response
    samples.sort()
    q = 'select subdict from main.variant_reportsub where module="base"'
    ret = await cf.exec_db(run_filter, cf, q=q)
    so_dic = loads(ret[0][0])['so'] # type: ignore
    so_dic[None] = 'Intergenic'
    so_dic[''] = 'Intergenic'
    q = f'select distinct v.base__so from main.variant as v, {ftable_name} as f where v.base__uid=f.base__uid'
    ret = await cf.exec_db(run_filter, cf, q=q)
    sos = [so_dic[v[0]] for v in ret] # type: ignore
    sos.sort()
    sosample = {}
    for so in sos:
        sosample[so] = []
        for sample in samples:
            sosample[so].append(0)
    for i in range(len(samples)):
        sample = samples[i]
        q = f'select v.base__so, count(*) from main.variant as v, {ftable_name} as f, main.sample as s where v.base__uid=f.base__uid and s.base__uid=v.base__uid and s.base__sample_id="' + sample + '" group by v.base__so order by v.base__so'
        ret = await cf.exec_db(run_filter, cf, q=q)
        for row in ret: # type: ignore
            (so, count) = row
            so = so_dic[so]
            sosample[so][i] = count
    data = {}
    for so in sos:
        row = []
        for i in range(len(samples)):
            row.append(sosample[so][i])
        data[so] = row
    response = {'data': {'samples': samples, 'sos': sos, 'socountdata': data}}
    await cf.close_db()
    return response
