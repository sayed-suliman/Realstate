// -------------------------paypal--------------------------------------
const paypalButtonsComponent = paypal.Buttons({
    // optional styling for buttons
    // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
    style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
    },

    // set up the transaction
    createOrder: (data, actions) => {
        // pass in any options from the v2 orders create call:
        // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
        return fetch('/paypal-payment', {
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
        }).then(({ id }) => {
            // console.log(url)
            return id;
        }).catch(e => {
            console.error(e.error)
        })
    },

    // finalize the transaction
    onApprove: (data, actions) => {
        const captureOrderHandler = (details) => {
            const payerName = details.payer.name.given_name;
            console.log(details)
            console.log(user)
            console.log('Transaction completed');
            fetch('/paypal-capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order: details, userId: user
                })
            }).then(res => {
                if (res.ok) {
                    return res.json();
                }
                return res.json().then(json => Promise.reject(json));
            }).then((res) => {
                console.log(res.user)
                if (res.user) {
                    console.log('asdf')
                    alert('You have successful purchase the package.')
                    const url = window.location.origin
                    setInterval(() => {
                        window.location.replace(`${url}/login`)
                    }, 3000);
                }
            }).catch(e => {
                console.error(e.error)
            })
        };

        return actions.order.capture().then(captureOrderHandler);
    },

    // handle unrecoverable errors
    onError: (err) => {
        console.error('An error prevented the buyer from checking out with PayPal');
    }
});

paypalButtonsComponent
    .render("#paypal")
    .catch((err) => {
        console.error('PayPal Buttons failed to render');
    });
//This function displays payment buttons on your web page.