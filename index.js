const responses = {
    "hello": "Hi there! How can I help you today?",
    "how are you": "I'm just a bot, but I'm doing great! How about you?",
    "what is your name": "I'm a simple chatbot created using TensorFlow.js.",
    "default": "I'm not sure how to respond to that. Can you ask something else?",
    "toxic": "Please keep the conversation respectful.",
};

const form = document.getElementById('question');
const input = document.getElementById('text');
const answer = document.getElementById('answer');
const score = 0.9;
let model;

// toxicity.load(score).then(mod => {
//     model = mod;
// });


form.addEventListener('submit', async (event) => {
    // On annule le comportement par defaut du formulaire HTML (donc pas de rechargement de page)
    event.preventDefault();

    const inputValue = input.value.toLowerCase().trim();

    // Si le formulaire est vide, alors on stop la fonction, pas de resultats
    if (inputValue == '') {
        return;
    }

    
    // answer.innerText = responses[inputValue] || responses.default
    // On appel la fonciton isToxic afin de verifier si la phrase envoyée est correcte ou non
    // On utilise await pour attendre le resultat de la fonction avant de continuer l'execution du code
    const toxic = await isToxic(inputValue);
    if (toxic) {
        answer.innerText = responses.toxic
        return;
    }

    for (const key in responses) {
        if (inputValue.includes(key)) {
            console.log(key);
            answer.innerText = responses[key]
            return;
        }
    }

    answer.innerText = responses.default
})

// const isToxic = async (sentence) => {
//     let toxic = false;

//     await model.classify([sentence]).then(predictions => {
//         predictions.forEach(prediction => {
//             console.log(prediction);
//             console.log(prediction.results[0])
//             if (prediction.results[0].match) {
//                 toxic = true;
//             }
//         })
//     })
//     console.log(toxic);

//     return toxic;
// }

const isToxic = async (sentence) => {

    // On met les options de notre demande à Google de verification
    const options = {
        comment:
        {
            // Dans text nous mettons ce que nous voulons valider
            text: sentence
        },
        // Les différents langages pris en compte
        languages: ["fr", "en"],
        requestedAttributes: {
            // les différents attributs a tester
            TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {}
        }
    }

    // On envois une requete fetch en await pour attendre son retour avant de continuer
    const request = await fetch("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDXbxpPaP_6TSKsOIjGNmpSf0ztiTn64bo", {
        // On précise l'envois du fetch en POST
        method: "POST",
        // On précise que l'on envois du contenu en JSON
        headers: {
            "Content-Type": 'application/json'
        },
        // Le corps de ma requete sera un objet javascript transformé en chaine de caractere
        body: JSON.stringify(options)
    });

    // On attend la reponse en json de la requete
    const response = await request.json();

    // Puis on verifie tous les score superieurs ou egaux à 80%, au quel cas, on renvois true
    for (key in response.attributeScores) { 
        if (response.attributeScores[key].summaryScore.value >= 0.80) {
            return true;
        }
    }

    return false;
}
