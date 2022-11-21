const stripeBtn = document.getElementById('stripe-payment');
const id = document.getElementById('driver-id') 
const dob = document.getElementById('dob')
stripeBtn.addEventListener('click', function () {
    // fetch('/stripe', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         userId: user
    //     })
    // }).then(res => {
    //     if (res.ok) {
    //         return res.json();
    //     }
    //     return res.json().then(json => Promise.reject(json));
    // }).then((req) => {
    //     window.location = req.url;
    // }).catch(e => {
    //     console.error(e.error)
    // })

    // This is your test publishable API key.
    const stripe = Stripe("pk_test_51M3z5GKOuw5TLgjou3da1GAfExQ2086PzeF7XIIhjvWs7FtT4hgVPiZW6LdZaBWWHetRLIbIUeSbO3isf4d72DWY00WRc6mhDD");
    const showInputMessage = (element, msg) => {
        element.nextElementSibling.classList.replace('opacity-0', 'opacity-100')
        element.nextElementSibling.textContent = msg

        setTimeout(() => {
            element.nextElementSibling.classList.replace('opacity-100', 'opacity-0')
            element.nextElementSibling.textContent = ""
        }, 4000)

    }
    if(!driverID_db && !dob_db){
        if (!id.value && !dob.value) {
            showInputMessage(id, "This field is required")
            showInputMessage(dob, "This field is required")
            return;
        } else if (!id.value) {
            showInputMessage(id, "This field is required")
            return;
        } else if (!dob.value) {
            showInputMessage(dob, "This field is required")
            return;
        } else if (dob.value) {
            const now = new Date();
            const age = new Date(dob.value)
    
            if (age.getDate() >= now.getDate()) {
                showInputMessage(dob, "DOB can't be greater than or equal to Today.")
                return;
            }
        }
    }

    let elements;
    let paymentId;
    let paymentElement;

    initialize();
    checkStatus();

    document
        .querySelector("#payment-form")
        .addEventListener("submit", handleSubmit);
    // Fetches a payment intent and captures the client secret
    async function initialize() {
        const response = await fetch("/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user, id: id.value, dob: dob.value }),
        });
        const { clientSecret, id: payId } = await response.json();
        paymentId = payId
        document.querySelector('.btn-pay').classList.add('d-none')

        const appearance = {
            theme: 'stripe',
        };
        elements = stripe.elements({ appearance, clientSecret });

        const paymentElementOptions = {
            layout: "tabs",
        };
        paymentElement = elements.create("payment", paymentElementOptions);
        paymentElement.mount("#payment-element");
        document.querySelector('.payment-form-btn').classList.replace('d-none', 'd-flex');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/success?user=${user}`,
            }
        });
        if (error.type === "card_error" || error.type === "validation_error") {
            showMessage(error.message);
        } else {
            showMessage("An unexpected error occurred.");
        }

        setLoading(false);
    }
    document.querySelector('#stripe-reset').addEventListener('click', cancelPayment)
    async function cancelPayment(e) {
        const response = await fetch("/cancel-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: paymentId }),
        });
        if (response.ok) {
            paymentElement.destroy()
            document.querySelector('.payment-form-btn').classList.replace('d-flex', 'd-none');
            document.querySelector('.btn-pay').classList.remove('d-none')
        }
    }



    // Fetches the payment intent status after payment submission
    async function checkStatus() {
        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        switch (paymentIntent.status) {
            case "succeeded":
                showMessage("Payment succeeded!");
                break;
            case "processing":
                showMessage("Your payment is processing.");
                break;
            case "requires_payment_method":
                showMessage("Your payment was not successful, please try again.");
                break;
            default:
                showMessage("Something went wrong.");
                break;
        }
    }

    // ------- UI helpers -------

    function showMessage(messageText) {
        const messageContainer = document.querySelector("#payment-message");

        messageContainer.classList.remove("d-none");
        messageContainer.textContent = messageText;

        setTimeout(function () {
            messageContainer.classList.add("d-none");
            messageText.textContent = "";
        }, 4000);
    }

    // Show a spinner on payment submission
    function setLoading(isLoading) {
        if (isLoading) {
            // Disable the button and show a spinner
            document.querySelector("#submit").disabled = true;
            document.querySelector("#spinner").classList.remove("d-none");
            document.querySelector("#button-text").classList.add("d-none");
        } else {
            document.querySelector("#submit").disabled = false;
            document.querySelector("#spinner").classList.add("d-none");
            document.querySelector("#button-text").classList.remove("d-none");
        }
    }



})