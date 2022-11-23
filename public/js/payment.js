const stripeBtn = document.getElementById('stripe-payment');
const id = document.getElementById('driver-id')
const dob = document.getElementById('dob')
const paypalBtn = document.querySelector('.paypal')
const showInputMessage = (element, msg) => {
    element.nextElementSibling.classList.replace('opacity-0', 'opacity-100')
    element.nextElementSibling.textContent = msg

    setTimeout(() => {
        element.nextElementSibling.classList.replace('opacity-100', 'opacity-0')
        element.nextElementSibling.textContent = ""
    }, 4000)

}

stripeBtn.addEventListener('click', function () {
    // This is your publishable API key.
    const stripe = Stripe(STRIPE_API);
    if (!driverID_db || !dob_db) {
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
    setCardBtnLoading(true)

    let elements;
    let paymentId;
    let paymentElement;

    initialize();
    checkStatus();
    setCardBtnLoading(false)

    document
        .querySelector("#payment-form")
        .addEventListener("submit", handleSubmit);
    // Fetches a payment intent and captures the client secret
    async function initialize() {
        var body = (driverID_db && dob_db) ? { userId: user } : { userId: user, id: id.value, dob: dob.value }
        const response = await fetch("/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const { clientSecret, id: payId } = await response.json();
        paymentId = payId
        console.log(clientSecret)
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
                return_url: `${window.location.origin}/success?user=${user}`,
                payment_method_data: {
                    billing_details: {
                        name: user_name,
                        email: user_email
                    }
                }
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
    function setCardBtnLoading(isLoading) {
        if (isLoading) {
            stripeBtn.disabled = true;
            paypalBtn.disabled = true;
            document.querySelector("#spinner-stripe").classList.remove("d-none");
            stripeBtn.querySelector("#button-text").classList.add("d-none");
        } else {
            stripeBtn.disabled = false;
            paypalBtn.disabled = false;
            document.querySelector("#spinner-stripe").classList.add("d-none");
            stripeBtn.querySelector("#button-text").classList.remove("d-none");
        }
    }
})

paypalBtn.addEventListener('click', async function () {
    if (!driverID_db || !dob_db) {
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
    paypalBtn.disabled = true;
    stripeBtn.disabled = true;
    document.querySelector("#spinner-paypal").classList.remove("d-none");
    paypalBtn.querySelector("#button-text").classList.add("d-none");

    var body = (driverID_db && dob_db) ? { userId: user } : { userId: user, id: id.value, dob: dob.value }
    const response = await fetch('/paypal', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
    } else {
        console.error(response)
    }
})
