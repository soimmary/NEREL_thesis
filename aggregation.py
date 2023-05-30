#!/usr/bin/env python
# coding: utf-8

# In[281]:


import pandas as pd
import json
from math import isnan


# In[414]:


df = pd.read_csv('TOLOKA_RESULTS.tsv', sep='\t')
df = df[
    [
        'INPUT:input', 
        'OUTPUT:connections', 
        'OUTPUT:no_relations', 
        'OUTPUT:incorrect_markup',
        'GOLDEN:connections',
        'GOLDEN:no_relations',
        'GOLDEN:incorrect_markup',
        'ASSIGNMENT:worker_id'
    ]
]


# In[415]:


df['OUTPUT:connections'] = df['OUTPUT:connections'].apply(lambda x: eval(x) if type(x) != float else x)
df['GOLDEN:connections'] = df['GOLDEN:connections'].apply(lambda x: eval(x) if type(x) != float else x)

control_df = df[df['GOLDEN:connections'].notna()].drop_duplicates(subset=['INPUT:input'])
res_df = df[df['GOLDEN:connections'].apply(lambda x: type(x) == float)]


# # Filtering annotators by their performance

# In[416]:


# Preparing a data frame

ann_df = df[df['GOLDEN:connections'].notna()]          [['OUTPUT:connections', 'GOLDEN:connections', 'ASSIGNMENT:worker_id']]

ann_df = (
    ann_df
    .groupby('ASSIGNMENT:worker_id')
    .agg(
        {'OUTPUT:connections': lambda x: list(x),
         'GOLDEN:connections': lambda x: list(x)}
    )
    .reset_index()
)

ann_df['GOLDEN:number'] = ann_df['GOLDEN:connections'].apply(len)


# In[417]:


ann_df.head(3)


# In[418]:


def dict_to_tuple(input_dict: list) -> list:
    '''
    The fuction converts a dict output 
    into a list of tuples leaving only 
    the following fields: t1.text, t2.text
    and connection_type.    
    '''
    
    return sorted([(i['T1']['text'], i['T2']['text'], i['connection_type']) for i in input_dict])


def find_matching(outputs: list, goldens: list) -> float:
    '''
    The fuction matches two lists of tuples
    (output of an annotator and a golden
    markup), compares them and then calculates
    the accuracy of an annotator's markup
    ''' 
    
    num_matches = 0
    num_all = 0
    for output, golden in zip(outputs, goldens):
        try:
            output = dict_to_tuple(output)
            golden  = dict_to_tuple(golden)
        except Exception as e:
            num_all += 1
            continue
        if output == golden:
            num_matches += 1
        num_all += 1
    return round(num_matches / num_all, 2)


# In[419]:


ann_df['WORKER:quality'] = ann_df.apply(lambda row: find_matching(row['OUTPUT:connections'], row['GOLDEN:connections']), axis=1)


# In[420]:


ann_df


# # Finding most-common responses

# In[421]:


res_df = res_df.join(ann_df[['ASSIGNMENT:worker_id', 'WORKER:quality']].set_index('ASSIGNMENT:worker_id'), on='ASSIGNMENT:worker_id')


# In[424]:


res_df = res_df.drop(
    columns=[
        'OUTPUT:no_relations', 
        'OUTPUT:incorrect_markup', 
        'GOLDEN:incorrect_markup', 
        'GOLDEN:no_relations',
        'GOLDEN:connections'
    ]
)


# In[425]:


res_df


# In[447]:


qualified_annotators = ann_df[
    (ann_df['WORKER:quality'] > 0.7) & 
    (ann_df['GOLDEN:number'] > 1)
]['ASSIGNMENT:worker_id'].to_list()


# In[448]:


print('Number of qualified annotators:', len(qualified_annotators))


# In[426]:


grouped_df = res_df.groupby('INPUT:input')


# In[537]:


grouped_df = (grouped_df
 .agg(
        {'OUTPUT:connections': lambda x: list(x),
         'WORKER:quality': lambda x: list(x)}
    )
 .reset_index()
)


# In[538]:


grouped_df


# In[574]:


def aggregate(annotations: list, weights: list) -> tuple:
    
    # if for some season there is only one annotaion
    if len(annotations) <= 1:
        return annotations
    
    # if there' s more than 1 annotation
    else:
        input_data = []
        c = Counter()
        
        for ann, weight in zip(annotations, weights):
            
            # if annotation is not 'NaN'
            if type(ann) != float:
                ann_tuple = tuple([(i['T1']['text'], i['T2']['text'], i['connection_type']) for i in ann])
                input_data.append([ann_tuple, weight])
                
            # if annotation is 'NaN'
            else:
                input_data.append(['no_relations', weight])
                
        # print(input_data[1])
        for k, v in input_data:
            c.update({k: v})
        return c.most_common(1)[0]


# In[578]:


grouped_df['OUTPUT:answer'] = grouped_df.apply(lambda row: aggregate(row['OUTPUT:connections'], row['WORKER:quality']), axis=1)


# In[577]:


(
    grouped_df
    .drop(columns=['OUTPUT:connections'])
    .to_csv('OUTPUT_answer.tsv', sep='\t', index=False)
)


# In[ ]:




