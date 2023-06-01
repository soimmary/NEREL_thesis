# Named Entity Relation Extractino from personal letters

The aim of our research is to create a dataset with annotated relations between named entities in a data-specific domain of diary texts, leveraging the existing "Razmecheno" dataset for NER (Atnashev et al., 2022) and using crowdsourcing, and evaluate different models for relation extraction in the context of a high paucity of labelled data. The objectives of the research are the following. First of all, we will train a model for named entity recognition in order to annotate more raw data from “Prozhito” than is represented in the “Razmecheno” dataset. Secondly, we will design and write a script for a new user-friendly interface for crowdsourced annotation of relations on “Yandex.Toloka” and, using it, add a relation markup layer to the dataset. Then, we will analyse various methods for addressing the issue of sparse human annotation and explore state-of-the-art models for relation extraction. Finally, we will fine-tune existing relation extraction models on our dataset.

# List of entity types
|  No. | Relation type  | No.  | Relation type  |  No. | Relation type |
|---|---|---|---|---|---|
| 1.   | alternative_name  |  8. | place_resides_in  | 15.  | works_as  |
| 2.  |  sibling  | 9. | schools_attended  | 16.  | title  |				
| 3. |  parent | 10.  | workplace  | 17.  | located_in  |
| 4.  | spouse  | 11.  | member_of  | 18.  | created_by  |
| 5.  | distant_relative  |  12. | religion  | 19.  |  founded_by |
| 6.  |  place_of_birth | 13.  | ideology  |   |   |
| 7.  |  place_of_death | 14.  | ethnicity |   |   |
							
			
# 1. Results of NER
We used "Razmecheno" (Atnashev et al., 2021) dataset to train our named entity recognition model. In "Razmecheno", to gain the same objective the researchers fine-tuned several Transformer-based models for named entity recognition (ruBERT, ruBERT-tiny, ruRoBERTa, XLM-RoBERTa) and evaluated their performance using overall micro F1-score. According to the results, ruBERT showed the best performance and achieved overall 0.81 F1-score. We improved this result using a different model and achieved **F1-score accounting for 0.87**. We used a Sentence RuBERT by DeepPavlov which is a “a representation‑based sentence encoder for Russian” and fine-tuned it on our dataset of personal-letters. In contrast to BERT, Sentence BERT exploits a siamese architecture. We assigned the following hyper-parameters: the number of epochs was 20, a learning rate accounted for 2e-5, and a weight_decay was 1e-4. As a loss function we used cross-entropy.

The script and the results are available [here](https://github.com/soimmary/NEREL_thesis/blob/main/NER_model.ipynb).

# 2. Crowdsourcing platform interface
In this research, data labelling will be carried out on a Russian crowdsourcing platform “Yandex.Toloka”. We have designed our own interface for the relation extraction, taking into account the platform capabilities and paying attention to the usability and user-friendliness of an interface for annotators.

The template is shown below.

![alt text](https://github.com/soimmary/NEREL_thesis/blob/main/toloka_interface/interface_example.png)

Regarding our template, on the left side of the screen, workers see a sentence with already annotated named entities which have colourful frames and entity types (“PER”, “CHAR”, “LOC”, “ORG”, “FAC”) written inside the frames. As stated before, the sentences with labelled entities were taken from the “Razmecheno” dataset (Atnashev et al. 2022). On the right side of the screen, annotators can set a relation between two entities by clicking on them and choosing a proper relation out of the list, which appears as soon as a worker chooses two entities. The list of possible relations is due to the types of entities chosen by an annotator, otherwise it would be inconvenient for a worker to scroll down the list containing 19 lines. In addition, we have added two checkboxes (“No relations” and “Incorrect markup”) which must be used by annotators in case there are no relations between entities in a text, or if named entities are labelled incorrectly. The task interface was designed using Java Script.

The scripts and the instructions are available [here](https://github.com/soimmary/NEREL_thesis/tree/main/toloka_interface).

# 3. Annotation results
All in all, the annotated corpus comprises a grand total of 750 distinct tasks, 70% of which contain one or more relations between entities. The total number of tokens accounts for 18235 and a number of relations is 940. Therefore, all the multiple relations within one task were annotated. The distribution of the relation classes is depicted below.

![alt text](https://github.com/soimmary/NEREL_thesis/blob/main/postprocessing/annotation_results.png)

# 5. Dataset for relatino extraction
The crowdsoursed annotations were aggregated, turned into [https://semeval2.fbk.eu/semeval2.php](SemEval) format and split into train, validation and test datasets.

[NRE_TRAIN.txt](https://github.com/soimmary/NEREL_thesis/blob/main/NRE_TRAIN.txt)
[NRE_VAL.txt](https://github.com/soimmary/NEREL_thesis/blob/main/NRE_VAL.txt)
[NRE_TEST.txt](https://github.com/soimmary/NEREL_thesis/blob/main/NRE_TEST.txt)

# 5. Results of relation extracion
We carried out experiments on the named entity relation dataset we have collected. Following the strategy of (Loukachevitch et al., 2021), we adopted an OpenNRE framework (Han et al., 2019) and used BERT (Devlin et al., 2019). The hyper-parameters were the following: $learning rate is 2e-5$, batch_size is 64, and the number of epochs was 15. We fine-tuned several state-of-the-art Transformer based models for relation extraction: BERT base, ruBERT, Sentence ruBERT. Their performance was evaluated using micro F1-score. The results are shown in Table 5. As we can see, Russian models outperformed BERT base, and Sentence ruBERT achieved the highest F1-score. 

|  Model | F1-score  |
|---|---|
| OpenNRE, BERT Base  | 0.7  |
| OpenNRE ruBERT | 0.97  |
| OpenNRE, Sentence ruBERT | 0.95  |

The script is available [here](https://github.com/soimmary/NEREL_thesis/blob/main/OpenNRE_training.ipynb).

# Authors

- Maria Bocharova, the Higher School of Economics
- Oleg Serikov, a scientific supervisor, the Higher School of Economics
- Ekaterina Voloshina, a scientific supervisor, the University of Gothenburg

# Bibgliography
Atnashev, T., Ganeeva, V., Kazakov, R., Matyash, D., Sonkin, M., Voloshina, E., Serikov, O., & Artemova, E. (2022). Razmecheno: Named Entity Recognition from Digital Archive of Diaries" Prozhito". In Proceedings of the 5th International Conference on Computational Linguistics in Bulgaria (CLIB 2022), pages 22–38, Sofia, Bulgaria.
