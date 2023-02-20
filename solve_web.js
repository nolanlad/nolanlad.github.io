function contains_all(l, s) {
  for (let i of l) {
    if (!s.includes(i)) {
      return false;
    }
  }
  return true;
}

function contains_none(l, s) {
  for (let i of l) {
    if (s.includes(i)) {
      return false;
    }
  }
  return true;
}

const contains_dic = {};
const not_contains_dic = {};

const all_words = new Set(words);

for (let letter of 'abcdefghijklmnopqrstuvwxyz') {
    contains_dic[letter] = new Set(words.filter(w => w.includes(letter)));
    not_contains_dic[letter] = new Set([...all_words].filter(x => !contains_dic[letter].has(x)));
  }

function num_candidates(guess,word,wordlist=all_words){
    let guess_set = new Set(guess);
    let word_set = new Set(word);
    let same_letters = new Set([...guess_set].filter(x => word_set.has(x)));
    let not_same_letters = new Set([...guess_set].filter(x => !word_set.has(x)));
    let cands = wordlist;
    for (let letter of same_letters) {
      cands = new Set(
        [...cands].filter(element => contains_dic[letter].has(element))
      );
    }
    for (let letter of not_same_letters) {
        cands = new Set(
            [...cands].filter(element => not_contains_dic[letter].has(element))
        );
    }
    for (let letter of same_letters) {
      for (let i=0; i<5; i++) {
        if (guess[i] == letter) {
          //right letter right place
          if (word[i] == letter) {
            let cands2 = new Set();
            for (let w of cands) {
              if (w[i] != letter) {
                cands2.add(w);
              }
            }
            cands = new Set([...cands].filter(x => !cands2.has(x)));
          }
          if (word[i]!=letter) {
            let cands2 = new Set();
            for (let w of cands) {
              if (w[i]==letter) {
                cands2.add(w);
              }
            }
            cands = new Set([...cands].filter(x => !cands2.has(x)));
          }
        }
      }
    }
    return cands;
}

function findBestGuess(cands){
    let bestCands = cands.size;
    let bestWord = null;
    for (let guess of words){
      let worstCase = 0;
      for (let word of cands){
        let cands2 = num_candidates(guess,word,wordlist=cands);
        if (cands2.size > worstCase){
          worstCase = cands2.size;
        }
      }
      if (worstCase < bestCands){
        bestCands = worstCase;
        bestWord = guess;
      }
    }
    return [bestCands,bestWord];
  }



function find_best_guess2(cands){
    let bestCands = cands.size;
    let bestWord = null;
    let worstCases = [];
    let guesses = [];
    for(let guess of words){
      let worstCase = 0;
      for(let word of cands){
        let cands2 = num_candidates(guess, word, cands);
        if(cands2.size > worstCase){
          worstCase = cands2.size;
          if(worstCase > bestCands){
            worstCase = cands.size;
            break;
          }
        }
      }
      if(worstCase < bestCands){
        bestCands = worstCase;
        bestWord = guess;
      }
      worstCases.push(worstCase);
      guesses.push(guess);
    }
    return [worstCases, guesses];
  }

function args_to_func(args) {
    function foo(w) {
        if (args.bad != null) {
            if (!contains_none(args.bad, w)) {
                return false;
            }
        }
        //yellow letters
        if (args.y1 != null) {
            for (let c of args.y1) {
                if (!w.includes(c)) {
                    return false;
                }
                if (w[0] == c) {
                    return false;
                }
            }
        }
        if (args.y2 != null) {
            for (let c of args.y2) {
                if (!w.includes(c)) {
                    return false;
                }
                if (w[1] == c) {
                    return false;
                }
            }
        }
        if (args.y3 != null) {
            for (let c of args.y3) {
                if (!w.includes(c)) {
                    return false;
                }
                if (w[2] == c) {
                    return false;
                }
            }
        }
        if (args.y4 != null) {
            for (let c of args.y4) {
                if (!w.includes(c)) {
                    return false;
                }
                if (w[3] == c) {
                    return false;
                }
            }
        }
        if (args.y5 != null) {
            for (let c of args.y5) {
                if (!w.includes(c)) {
                    return false;
                }
                if (w[4] == c) {
                    return false;
                }
            }
        }

        //green letters
        if (args.g1 != null) {
            if (args.g1 != w[0]) {
                return false;
            }
        }
        if (args.g2 != null) {
            if (args.g2 != w[1]) {
                return false;
            }
        }
        if (args.g3 != null) {
            if (args.g3 != w[2]) {
                return false;
            }
        }
        if (args.g4 != null) {
            if (args.g4 != w[3]) {
                return false;
            }
        }
        if (args.g5 != null) {
            if (args.g5 != w[4]) {
                return false;
            }
        }
        return true;
    }

    return foo;
}

function returnBestGuesses(cands){
    let [x, y] = find_best_guess2(new Set(cands));
    let s = Array.from(new Set(x));
    s = Array.from(s);
    s = s.sort(function(a, b) { return a > b ? 1 : -1}); // javascript is a meme language 
    let guesses = x.map((worst_case,index) => {
                    if(worst_case == s[0]){
                        return y[index];
                    }
                }).filter((word) => {
                    return word !== undefined;
                });
    return [s[0],guesses]
}

function createList(arr) {
    let list = document.getElementById('anslist')
    list.innerHTML = "";
    for (let i = 0; i < arr.length; i++) {
      let item = document.createElement('li');
      item.appendChild(document.createTextNode(arr[i]));
      list.appendChild(item);
    }
    return list;
  }

  function getFormElements(formID) {
      let form = document.getElementById(formID);
      let elements = form.elements;
      let formElements = [];

      for(let i = 0; i < elements.length; i++) {
          formElements.push(elements[i].value);
      }

      return formElements;
  }

  function arrayTo5x5(arr){
    var newArr = [],
        row = []
    for(var i = 0; i < arr.length; i++){
        row.push(arr[i]);
        if(row.length == 5){
            newArr.push(row);
            row = [];
        }
    }
    return newArr;
}
function transpose(arr){
    let transposedArr = [];
    for(let i = 0; i < arr.length; i++){
        let row = [];
        for(let j = 0; j < arr[i].length; j++){
            row.push(arr[j][i]);
        }
        transposedArr.push(row);
    }
    return transposedArr;
}

function removeEmptyStrings(arr){
  return arr.filter(function(el) {
    return el !== "";
});
}
