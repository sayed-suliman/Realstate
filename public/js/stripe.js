console.log(user)
const stripeBtn = document.getElementById('stripe-payment');
stripeBtn.addEventListener('click', function () {
    fetch('/stripe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user
        })
    }).then(res => {
        if (res.ok) {
            return res.json();
        }
        return res.json().then(json => Promise.reject(json));
    }).then((req) => {
        window.location = req.url;
    }).catch(e => {
        console.error(e.error)
    })
})