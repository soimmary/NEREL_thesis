exports.Task = extend(TolokaHandlebarsTask, function(options) {
  TolokaHandlebarsTask.call(this, options);
}, {
  onRender: function() {
    this.rendered = true;

    const task = this.getDOMElement();
    const textElement = task.querySelector('.text');
    const connectionsBodyElement = task.querySelector('.connections__body');
    const inputValues = this.getTask().input_values;
    const outputValues = this.getSolution().output_values;
    const workspaceOptions = this.getWorkspaceOptions();

    createTextAnnotationInterface.call(this);

    if (outputValues.connections && outputValues.connections.length) {
      outputValues.connections.forEach(connection => {
        const newRow = createConnectionsRow(connection.T1, connection.T2, connection.connection_type);
        connectionsBodyElement.insertAdjacentHTML('beforeend',  newRow);
      });
    }

    if (!workspaceOptions.isReviewMode && !workspaceOptions.isReadOnly) {
      textElement.addEventListener('click', (e) => {
        const tagElement = e.target.closest('.text__selected');
  
        if (tagElement) {
          const wordData = {
            value: tagElement.dataset.value,
            text: tagElement.dataset.text,
            start: tagElement.dataset.start,
            end: tagElement.dataset.end,
            color: tagElement.dataset.color
          };
  
          const unfinishedRow = connectionsBodyElement.querySelector('.connections__row[data-status="unfinished"]');
  
          if (unfinishedRow) {
            const colSecondWord = unfinishedRow.querySelector('.connections__col_word_2');
  
            if (!colSecondWord.hasChildNodes()) {
              const firstWordElement = unfinishedRow.querySelector('.connections__col_word_1 .text__selected');
              const select = unfinishedRow.querySelector('.connections__type-select');
              const wordData1 = {
                value: firstWordElement.dataset.value,
                text: firstWordElement.dataset.text,
                start: firstWordElement.dataset.start,
                end: firstWordElement.dataset.end,
                color: firstWordElement.dataset.color
              };
  
              const options = createConnectionTypeOptions(wordData1.value, wordData.value);
              const equalWords = Object.keys(wordData).every(key => wordData[key] === wordData1[key]);
    
              if (!equalWords && options.length > 1) {
                colSecondWord.innerHTML = createTextTag({...wordData});
                select.disabled = false;
                select.innerHTML = options.join('');
              }
            }
          } else {
            const newRow = createConnectionsRow(wordData);
            connectionsBodyElement.insertAdjacentHTML('beforeend',  newRow);
          }
  
          this.updateSolution();
        }
      });
  
      connectionsBodyElement.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.connections__btn-remove');
  
        if (removeBtn) {
          const row = e.target.closest('.connections__row');
          row.remove();
          this.updateSolution();
        }
      });
  
      connectionsBodyElement.addEventListener('change', (e) => {
        const isSelect = e.target.classList.contains('connections__type-select');
  
        if (isSelect) {
          const row = e.target.closest('.connections__row');
  
          if (e.target.value) {
            row.dataset.status = 'finished';
            row.classList.remove('connections__row_err');
          } else {
            row.dataset.status = 'unfinished';
          }
  
          this.updateSolution();
        }
      });
    }
  },
  updateSolution: function() {
    const task = this.getDOMElement();
    const rows = task.querySelectorAll('.connections__row');

    const connectionsResult = [];

    if (rows && rows.length) {
      rows.forEach(row => {
        if (row.dataset.status === 'finished') {
          const firstWordElement = row.querySelector('.connections__col_word_1 .text__selected');
          const secondWordElement = row.querySelector('.connections__col_word_2 .text__selected');
          const select = row.querySelector('.connections__type-select');
  
          const wordData1 = {
            value: firstWordElement.dataset.value,
            text: firstWordElement.dataset.text,
            start: firstWordElement.dataset.start,
            end: firstWordElement.dataset.end,
            color: firstWordElement.dataset.color
          };
  
          const wordData2 = {
            value: secondWordElement.dataset.value,
            text: secondWordElement.dataset.text,
            start: secondWordElement.dataset.start,
            end: secondWordElement.dataset.end,
            color: secondWordElement.dataset.color
          };
  
          const out = {
            T1: {...wordData1},
            T2: {...wordData2},
            connection_type: select.value
          };
  
          connectionsResult.push(out);
        }
      });
    }

    this.setSolutionOutputValue('connections', connectionsResult);
  },
  addError: function(message, field, errors) {
      errors || (errors = {
          task_id: this.getOptions().task.id,
          errors: {}
      });
      errors.errors[field] = {
          message: message
      };

      return errors;
  },

  validate: function(solution) {
    let errors = null;
    const outputValues = solution.output_values;
    const task = this.getDOMElement();

    const rows = task.querySelectorAll('.connections__row');

    rows.forEach(row => {
      if (row.dataset.status !== 'finished') {
        row.classList.add('connections__row_err');
        errors = this.addError("Заполните все добавленные связи", "__TASK__", errors);
      } else {
        row.classList.remove('connections__row_err');
      }
    });

    return errors || TolokaHandlebarsTask.prototype.validate.call(this, solution);
  },
  onDestroy: function() {
      // Задание завершено, можно освобождать (если были использованы) глобальные ресурсы
  }
});

function extend(ParentClass, constructorFunction, prototypeHash) {
  constructorFunction = constructorFunction || function() {};
  prototypeHash = prototypeHash || {};
  if (ParentClass) {
      constructorFunction.prototype = Object.create(ParentClass.prototype);
  }
  for (var i in prototypeHash) {
      constructorFunction.prototype[i] = prototypeHash[i];
  }
  return constructorFunction;
}

function createTextAnnotationInterface() {
  const task = this.getDOMElement();
  const text = task.querySelector('.text');
  const inputTask = this.getTask().input_values;

  if (inputTask.input && inputTask.text_review_mode && inputTask.text_review_mode.length && inputTask.result) {
    const textReviewMode = inputTask.text_review_mode;
    const newInnerHtml = recoveryHelper(textReviewMode, inputTask.input);

    text.innerHTML = newInnerHtml;
  }
}

function recoveryHelper(recoveryData, inputText) {
    let lastIndex = 0;

    if (!recoveryData) {
      return '<span></span>';
    }

    let div = document.createElement('div');
    div.style.whiteSpace = 'pre-line';
    div.innerHTML = inputText;
    let inputTextModified = div.innerHTML;

    const newInnerHtml = recoveryData.map(data => {
      const start = lastIndex;
      const end = lastIndex + data.contentLength - 1;

      lastIndex += data.contentLength;

      if (data.class === 'text__unselected') {
        return (`<span class="text__unselected">
                  ${inputTextModified.slice(start, end + 1)}
                </span>`);
      } else {
        let color = data.textInputClasses[1].split('_');
        color = color[color.length - 1];
        const text = inputTextModified.slice(start, end + 1);

        return createTextTag({value: data.value, text, start, end, color});
      }
    });

    return newInnerHtml.join('');
}

function createTextTag({value, text, start, end, color}) {
 return (
    `<span class="text__selected" data-value="${value}" data-text="${text}" data-start="${start}" data-end="${end}" data-color="${color}">
      <div class="text__selected-inner text__selected-inner_${color}">
        <div class="text__tag-selector">
          <div class="text__input-container">
            <div class="text__input text__input_${color}">${value}</div>
          </div>
        </div>
        <span class="text__value">${text}</span>
      </div>
    </span>`
  );
}

function createConnectionsRow(wordData1, wordData2, connectionType) {
  if (!wordData1) {
    return '';
  }

  const options = createConnectionTypeOptions(wordData1.value, wordData2?.value, connectionType);

  let textTag1 = createTextTag({...wordData1});
  let textTag2 = '';
  let disabled = 'disabled';
  let status = 'finished';

  if (wordData2) {
    textTag2 = createTextTag({...wordData2});
    disabled = '';
  }

  if (!wordData2 || !connectionType) {
    status = 'unfinished';
  }

  return (
    `<div class="connections__row" data-status=${status}>
      <div class="connections__col connections__col_word_1">${textTag1}</div>
        <div class="connections__col connections__col_type">
          <select class="connections__type-select" name="connection_type" ${disabled}>
            ${options.join('')}
          </select>
        </div>
      <div class="connections__col connections__col_word_2">${textTag2}</div>
      <div class="connections__col connections__col_controls">
        <button type="button" class="connections__btn-remove">X</button>
      </div>
    </div>`
  );
}

function createConnectionTypeOptions(tag1, tag2, connectionType) {
  let options = [
    {
      value: '',
      label: 'Тип связи'
    }
  ];

  if (tag1 === 'per' && tag2 === 'per') {
    options = options.concat([
      {
        value: 'alternative_name',
        label: 'alternative_name'
      },
      {
        value: 'sibling',
        label: 'sibling'
      },
      {
        value: 'parent',
        label: 'parent'
      },
      {
        value: 'spouse',
        label: 'spouse'
      }
    ]);
  }

  if (tag1 === 'per' && tag2 === 'loc') {
    options = options.concat([
      {
        value: 'place_of_birth',
        label: 'place_of_birth'
      },
      {
        value: 'place_of_death',
        label: 'place_of_death'
      },
      {
        value: 'place_resides_in',
        label: 'place_resides_in'
      }
    ]);
  }

  if (tag1 === 'per' && tag2 === 'fac') {
    options = options.concat([
      {
        value: 'schools_attended',
        label: 'schools_attended'
      },
      {
        value: 'workplace',
        label: 'workplace'
      }
    ]);
  }

  if (tag1 === 'per' && tag2 === 'org') {
    options = options.concat([
      {
        value: 'workplace',
        label: 'workplace'
      },
      {
        value: 'member_of',
        label: 'member_of'
      }
    ]);
  }

  if (tag1 === 'char' && tag2 === 'per') {
    options = options.concat([
      {
        value: 'religion',
        label: 'religion'
      },
      {
        value: 'ideology',
        label: 'ideology'
      },
      {
        value: 'ethnicity',
        label: 'ethnicity'
      },
      {
        value: 'knows',
        label: 'knows'
      },
      {
        value: 'works_as',
        label: 'works_as'
      }
    ]);
  }

  if (tag1 === 'per' && tag2 === 'char') {
    options = options.concat([
      {
        value: 'religion',
        label: 'religion'
      },
      {
        value: 'ideology',
        label: 'ideology'
      },
      {
        value: 'ethnicity',
        label: 'ethnicity'
      },
      {
        value: 'knows',
        label: 'knows'
      },
      {
        value: 'works_as',
        label: 'works_as'
      }
    ]);
  }

  if (tag1 === 'org' && tag2 === 'per') {
    options = options.concat([
      {
        value: 'founded_by',
        label: 'founded_by'
      }
    ]);
  }

  if (tag1 === 'org' && tag2 === 'loc') {
    options = options.concat([
      {
        value: 'located_in',
        label: 'located_in'
      },
      {
        value: 'headquartered_in',
        label: 'headquartered_in'
      }
    ]);
  }

  if (tag1 === 'fac' && tag2 === 'per') {
    options = options.concat([
      {
        value: 'created_by',
        label: 'created_by'
      }
    ]);
  }

  if (tag1 === 'fac' && tag2 === 'loc') {
    options = options.concat([
      {
        value: 'located_in',
        label: 'located_in'
      }
    ]);
  }

  return options.map(option => {
    return (`<option value="${option.value}" ${connectionType && connectionType === option.value ? 'selected': ''}>${option.label}</option>`);
  });
}

Handlebars.registerHelper('textAnnotationInterface', (input) => {
  return new Handlebars.SafeString(`
    <div class="main">
      <div class="left">
        <div class="text">
          ${input}
        </div>
      </div>
    </div>`);
});
