document.addEventListener('DOMContentLoaded', () => {
    var timeout = 2000; 
    var json_string = ''
   
    var known_words = [];
    var wrong_words = [];
    var acc = 0;
    fetch('spa_words2.json').then(response=>response.json()).then(data => {

        const cards = (data)
        console.log(cards)

        // Function to update SM-2 values
        function updateCardSM2(card, quality) {
            if (quality >= 3) {
                if (card.reps === 0) {
                    card.interval = 1;
                } else if (card.reps === 1) {
                    card.interval = 6;
                } else {
                    card.interval = Math.round(card.interval * card.ease);
                }
                card.reps++;
            } else {
                card.reps = 0;
                card.interval = 1;
            }

            card.ease = Math.max(1.3, card.ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        }

        function generateOptions(correctAnswer) {
            let options = [correctAnswer];
            const otherAnswers = cards.map(card => card.answer).filter(answer => answer !== correctAnswer);
            while (options.length < 5) {
                const randomAnswer = otherAnswers[Math.floor(Math.random() * otherAnswers.length)];
                if (!options.includes(randomAnswer)) {
                    options.push(randomAnswer);
                }
            }
            // Shuffle the options to randomize their order
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]]; // Swap
            }
            options.push("I don't know")
            return options;
        }

        function displayCard() {
            const dueCards = cards.filter(card => card.reps === 0 || card.interval <= 1);
            if (dueCards.length === 0) {
                alert("No cards due for review! Come back later.");
                return;
            }
            // const card = dueCards[Math.floor(Math.random() * dueCards.length)];
            const card = dueCards[acc];
            acc+=1;
            const options = generateOptions(card.answer);

            const questionElement = document.getElementById('question');
            const answersElement = document.getElementById('answers');

            questionElement.textContent = `What is the English word for "${card.question}"?`;
            answersElement.innerHTML = ''; // Clear previous options

            options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.className = 'answer';
                button.onclick = function() {
                    const correctAnswer = card.answer;
                    if (option === correctAnswer) {
                        this.style.backgroundColor = "#28a745"; // Correct answer, turn green
                        known_words.push(card.question)
                    } else {
                        this.style.backgroundColor = "#dc3545"; // Wrong answer, turn red
                        // Highlight the correct answer
                        Array.from(answersElement.children).forEach(child => {
                            if (child.textContent === correctAnswer) {
                                child.style.backgroundColor = "#28a745"; // Turn the correct answer green
                            }
                        });
                        wrong_words.push(card.question)
                    }
                    // Disable all buttons to prevent multiple answers
                    Array.from(answersElement.children).forEach(child => child.disabled = true);
                    
                    // Wait for 3 seconds, then load new card
                    setTimeout(displayCard, timeout);
                    console.log(known_words)
                    console.log(wrong_words)
                    
                };
                answersElement.appendChild(button);
            });
        }

        displayCard();
    });

});

