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
							
			
# Results of NER
We used "Razmecheno" (Atnashev et al., 2021) dataset to train our named entity recognition model. In "Razmecheno", to gain the same objective the researchers fine-tuned several Transformer-based models for named entity recognition (ruBERT, ruBERT-tiny, ruRoBERTa, XLM-RoBERTa) and evaluated their performance using overall micro F1-score. According to the results, ruBERT showed the best performance and achieved overall 0.81 F1-score. We improved this result using a different model and achieved **F1-score accounting for 0.87**. We used a Sentence RuBERT by DeepPavlov which is a “a representation‑based sentence encoder for Russian” and fine-tuned it on our dataset of personal-letters. In contrast to BERT, Sentence BERT exploits a siamese architecture. We assigned the following hyper-parameters: the number of epochs was 20, a learning rate accounted for 2e-5, and a weight_decay was 1e-4. As a loss function we used cross-entropy.

The script and the results are available [here](https://github.com/soimmary/NEREL_thesis/blob/main/NER_model.ipynb).


# Results of relation extracion

# Authors

- Maria Bocharova, the Higher School of Economics
- Oleg Serikov, a scientific supervisor, the Higher School of Economics
- Ekaterina Voloshina, a scientific supervisor, 
