import pandas as pd
import pickle
import hddm

data = hddm.load_csv('ddmData.csv')

a1 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	})
a1.find_starting_values()
a1.sample(20000, burn=5000, thin=5, dbname='a1.db', db='pickle')
a1.save('a1')

a2 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['condition'],
	})
a2.find_starting_values()
a2.sample(20000, burn=5000, thin=5, dbname='a2.db', db='pickle')
a2.save('a2')

a3 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['age'],
	})
a3.find_starting_values()
a3.sample(20000, burn=5000, thin=5, dbname='a3.db', db='pickle')
a3.save('a3')

a4 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country', 'condition'],
	})
a4.find_starting_values()
a4.sample(20000, burn=5000, thin=5, dbname='a4.db', db='pickle')
a4.save('a4')

a5 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country', 'age'],
	})
a5.find_starting_values()
a5.sample(20000, burn=5000, thin=5, dbname='a5.db', db='pickle')
a5.save('a5')

a6 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['condition', 'distribution'],
	})
a6.find_starting_values()
a6.sample(20000, burn=5000, thin=5, dbname='a6.db', db='pickle')
a6.save('a6')

a7 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['condition', 'age'],
	})
a7.find_starting_values()
a7.sample(20000, burn=5000, thin=5, dbname='a7.db', db='pickle')
a7.save('a7')

a8 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country', 'condition', 'age'],
	})
a8.find_starting_values()
a8.sample(20000, burn=5000, thin=5, dbname='a8.db', db='pickle')
a8.save('a8')

a9 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['condition', 'distribution', 'age'],
	})
a9.find_starting_values()
a9.sample(20000, burn=5000, thin=5, dbname='a9.db', db='pickle')
a9.save('a9')

a10 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country', 'condition', 'age', 'distribution'],
	})
a10.find_starting_values()
a10.sample(20000, burn=5000, thin=5, dbname='a10.db', db='pickle')
a10.save('a10')

a11 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'distribution', 'age'],
	'a': ['country', 'condition', 'distribution'],
	})
a11.find_starting_values()
a11.sample(20000, burn=5000, thin=5, dbname='a11.db', db='pickle')
a11.save('a11')

a12 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country'],
	})
a12.find_starting_values()
a12.sample(20000, burn=5000, thin=5, dbname='a12.db', db='pickle')
a12.save('a12')

a13 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['condition'],
	})
a13.find_starting_values()
a13.sample(20000, burn=5000, thin=5, dbname='a13.db', db='pickle')
a13.save('a13')

a14 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['age'],
	})
a14.find_starting_values()
a14.sample(20000, burn=5000, thin=5, dbname='a14.db', db='pickle')
a14.save('a14')

a15 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition'],
	})
a15.find_starting_values()
a15.sample(20000, burn=5000, thin=5, dbname='a15.db', db='pickle')
a15.save('a15')

a16 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'age'],
	})
a16.find_starting_values()
a16.sample(20000, burn=5000, thin=5, dbname='a16.db', db='pickle')
a16.save('a16')

a17 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['condition', 'distribution'],
	})
a17.find_starting_values()
a17.sample(20000, burn=5000, thin=5, dbname='a17.db', db='pickle')
a17.save('a17')

a18 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['condition', 'age'],
	})
a18.find_starting_values()
a18.sample(20000, burn=5000, thin=5, dbname='a18.db', db='pickle')
a18.save('a18')

a19 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age'],
	})
a19.find_starting_values()
a19.sample(20000, burn=5000, thin=5, dbname='a19.db', db='pickle')
a19.save('a19')

a20 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['condition', 'distribution', 'age'],
	})
a20.find_starting_values()
a20.sample(20000, burn=5000, thin=5, dbname='a20.db', db='pickle')
a20.save('a20')

a21 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'distribution'],
	})
a21.find_starting_values()
a21.sample(20000, burn=5000, thin=5, dbname='a21.db', db='pickle')
a21.save('a21')

a22 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	})
a22.find_starting_values()
a22.sample(20000, burn=5000, thin=5, dbname='a22.db', db='pickle')
a22.save('a22')

v1 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'])
v1.find_starting_values()
v1.sample(20000, burn=5000, thin=5, dbname='v1.db', db='pickle')
v1.save('v1')

v2 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country'],
	})
v2.find_starting_values()
v2.sample(20000, burn=5000, thin=5, dbname='v2.db', db='pickle')
v2.save('v2')

v3 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['condition'],
	})
v3.find_starting_values()
v3.sample(20000, burn=5000, thin=5, dbname='v3.db', db='pickle')
v3.save('v3')

v4 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['age'],
	})
v4.find_starting_values()
v4.sample(20000, burn=5000, thin=5, dbname='v4.db', db='pickle')
v4.save('v4')

v5 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition'],
	})
v5.find_starting_values()
v5.sample(20000, burn=5000, thin=5, dbname='v5.db', db='pickle')
v5.save('v5')

v6 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'age'],
	})
v6.find_starting_values()
v6.sample(20000, burn=5000, thin=5, dbname='v6.db', db='pickle')
v6.save('v6')

v7 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['condition', 'distribution'],
	})
v7.find_starting_values()
v7.sample(20000, burn=5000, thin=5, dbname='v7.db', db='pickle')
v7.save('v7')

v8 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['condition', 'age'],
	})
v8.find_starting_values()
v8.sample(20000, burn=5000, thin=5, dbname='v8.db', db='pickle')
v8.save('v8')

v9 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age'],
	})
v9.find_starting_values()
v9.sample(20000, burn=5000, thin=5, dbname='v9.db', db='pickle')
v9.save('v9')

v10 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['condition', 'distribution', 'age'],
	})
v10.find_starting_values()
v10.sample(20000, burn=5000, thin=5, dbname='v10.db', db='pickle')
v10.save('v10')

v11 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	})
v11.find_starting_values()
v11.sample(20000, burn=5000, thin=5, dbname='v11.db', db='pickle')
v11.save('v11')

v12 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'distribution'],
	})
v12.find_starting_values()
v12.sample(20000, burn=5000, thin=5, dbname='v12.db', db='pickle')
v12.save('v12')

v13 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country'],
	})
v13.find_starting_values()
v13.sample(20000, burn=5000, thin=5, dbname='v13.db', db='pickle')
v13.save('v13')

v14 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['condition'],
	})
v14.find_starting_values()
v14.sample(20000, burn=5000, thin=5, dbname='v14.db', db='pickle')
v14.save('v14')

v15 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['age'],
	})
v15.find_starting_values()
v15.sample(20000, burn=5000, thin=5, dbname='v15.db', db='pickle')
v15.save('v15')

v16 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country', 'condition'],
	})
v16.find_starting_values()
v16.sample(20000, burn=5000, thin=5, dbname='v16.db', db='pickle')
v16.save('v16')

v17 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country', 'age'],
	})
v17.find_starting_values()
v17.sample(20000, burn=5000, thin=5, dbname='v17.db', db='pickle')
v17.save('v17')

v18 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['condition', 'distribution'],
	})
v18.find_starting_values()
v18.sample(20000, burn=5000, thin=5, dbname='v18.db', db='pickle')
v18.save('v18')

v19 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['condition', 'age'],
	})
v19.find_starting_values()
v19.sample(20000, burn=5000, thin=5, dbname='v19.db', db='pickle')
v19.save('v19')

v20 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country', 'condition', 'distribution'],
	})
v20.find_starting_values()
v20.sample(20000, burn=5000, thin=5, dbname='v20.db', db='pickle')
v20.save('v20')

v21 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country', 'condition', 'age'],
	})
v21.find_starting_values()
v21.sample(20000, burn=5000, thin=5, dbname='v21.db', db='pickle')
v21.save('v21')

v22 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['condition', 'distribution', 'age'],
	})
v22.find_starting_values()
v22.sample(20000, burn=5000, thin=5, dbname='v22.db', db='pickle')
v22.save('v22')

v23 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	'a': ['country', 'condition', 'age', 'distribution'],
	'v': ['country', 'condition', 'age', 'distribution'],
	})
v23.find_starting_values()
v23.sample(20000, burn=5000, thin=5, dbname='v23.db', db='pickle')
v23.save('v23')

t1 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country'],
	})
t1.find_starting_values()
t1.sample(20000, burn=5000, thin=5, dbname='t1.db', db='pickle')
t1.save('t1')

t2 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['condition'],
	})
t2.find_starting_values()
t2.sample(20000, burn=5000, thin=5, dbname='t2.db', db='pickle')
t2.save('t2')

t3 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['age'],
	})
t3.find_starting_values()
t3.sample(20000, burn=5000, thin=5, dbname='t3.db', db='pickle')
t3.save('t3')

t4= hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country', 'condition'],
	})
t4.find_starting_values()
t4.sample(20000, burn=5000, thin=5, dbname='t4.db', db='pickle')
t4.save('t4')

t5 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country', 'age'],
	})
t5.find_starting_values()
t5.sample(20000, burn=5000, thin=5, dbname='t5.db', db='pickle')
t5.save('t5')

t6 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['condition', 'age'],
	})
t6.find_starting_values()
t6.sample(20000, burn=5000, thin=5, dbname='t6.db', db='pickle')
t6.save('t6')

t7 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['condition', 'distribution'],
	})
t7.find_starting_values()
t7.sample(20000, burn=5000, thin=5, dbname='t7.db', db='pickle')
t7.save('t7')

t8 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country', 'condition', 'age'],
	})
t8.find_starting_values()
t8.sample(20000, burn=5000, thin=5, dbname='t8.db', db='pickle')
t8.save('t8')

t9 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country', 'condition', 'distribution'],
	})
t9.find_starting_values()
t9.sample(20000, burn=5000, thin=5, dbname='t9.db', db='pickle')
t9.save('t9')

t10 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['condition', 'distribution', 'age'],
	})
t10.find_starting_values()
t10.sample(20000, burn=5000, thin=5, dbname='t10.db', db='pickle')
t10.save('t10')

t11 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	't': ['country', 'condition', 'distribution', 'age'],
	})
t11.find_starting_values()
t11.sample(20000, burn=5000, thin=5, dbname='t11.db', db='pickle')
t11.save('t11')

z1 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['country'],
	})
z1.find_starting_values()
z1.sample(20000, burn=5000, thin=5, dbname='z1.db', db='pickle')
z1.save('z1')

z2 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['condition'],
	})
z2.find_starting_values()
z2.sample(20000, burn=5000, thin=5, dbname='z2.db', db='pickle')
z2.save('z2')

z3 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['age'],
	})
z3.find_starting_values()
z3.sample(20000, burn=5000, thin=5, dbname='z3.db', db='pickle')
z3.save('z3')

z4 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['country', 'condition'],
	})
z4.find_starting_values()
z4.sample(20000, burn=5000, thin=5, dbname='z4.db', db='pickle')
z4.save('z4')

z5 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['country', 'age'],
	})
z5.find_starting_values()
z5.sample(20000, burn=5000, thin=5, dbname='z5.db', db='pickle')
z5.save('z5')

z6 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['condition', 'age'],
	})
z6.find_starting_values()
z6.sample(20000, burn=5000, thin=5, dbname='z6.db', db='pickle')
z6.save('z6')

z7 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'v': ['country', 'condition', 'age', 'distribution'],
	'a': ['country'],
	'z': ['country', 'condition', 'age'],
	})
z7.find_starting_values()
z7.sample(20000, burn=5000, thin=5, dbname='z7.db', db='pickle')
z7.save('z7')

z8 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country'],
	})
z8.find_starting_values()
z8.sample(20000, burn=5000, thin=5, dbname='z8.db', db='pickle')
z8.save('z8')

z9 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['condition'],
	})
z9.find_starting_values()
z9.sample(20000, burn=5000, thin=5, dbname='z9.db', db='pickle')
z9.save('z9')

z10 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['age'],
	})
z10.find_starting_values()
z10.sample(20000, burn=5000, thin=5, dbname='z10.db', db='pickle')
z10.save('z10')

z11 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'condition'],
	})
z11.find_starting_values()
z11.sample(20000, burn=5000, thin=5, dbname='z11.db', db='pickle')
z11.save('z11')

z12 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'age'],
	})
z12.find_starting_values()
z12.sample(20000, burn=5000, thin=5, dbname='z12.db', db='pickle')
z12.save('z12')

z13 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['condition', 'age'],
	})
z13.find_starting_values()
z13.sample(20000, burn=5000, thin=5, dbname='z13.db', db='pickle')
z13.save('z13')

z14 = hddm.HDDM(data, p_outlier=0.05, bias=True, group_only_nodes=['z'], depends_on={
	'z': ['country', 'condition', 'age'],
	})
z14.find_starting_values()
z14.sample(20000, burn=5000, thin=5, dbname='z14.db', db='pickle')
z14.save('z14')