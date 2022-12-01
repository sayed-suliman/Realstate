const stripeBtn = document.getElementById('stripe-payment');
const id = document.getElementById('driver-id')
const dob = document.getElementById('dob')
const paypalBtn = document.querySelector('.paypal')
const couponBtn = document.querySelector('#coupon-btn')
const couponInput = document.querySelector('#coupon-code')
const couponRegister = document.querySelector('#coupon-register')

let couponId;

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
            console.log('now', now, 'age', age)
            if (age > now) {
                showInputMessage(dob, "DOB can't be greater than or equal to Today.")
                return;
            }
        }
    }
    setCardBtnLoading(true)

    let elements;
    let paymentId;
    let paymentElement;
    console.log(couponId)
    initialize();
    checkStatus();

    // setCardBtnLoading(false)

    document
        .querySelector("#payment-form")
        .addEventListener("submit", handleSubmit);
    // Fetches a payment intent and captures the client secret
    async function initialize() {
        var body = (driverID_db && dob_db) ? { userId: user, couponId } : { userId: user, id: id.value, dob: dob.value, couponId }
        const response = await fetch("/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const { clientSecret, id: payId, error } = await response.json();
        // hide the coupon input when the payment is initialized
        document.querySelector('.coupon-input-row').classList.add('d-none')
        paymentId = payId
        setCardBtnLoading(false)
        if (error) {
            showInputMessage(id, error)
            return;
        }
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
                return_url: `${window.location.origin}/success?user=${user}&couponId=${couponId}`,
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
            // show the coupon
            document.querySelector('.coupon-input-row').classList.remove('d-none')
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
            stripeBtn.querySelector("#spinner-stripe").classList.remove("d-none");
            stripeBtn.querySelector("#button-text").classList.add("d-none");
        } else {
            stripeBtn.disabled = false;
            paypalBtn.disabled = false;
            stripeBtn.querySelector("#spinner-stripe").classList.add("d-none");
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
    setPaypalLoading(true)

    var body = (driverID_db && dob_db) ? { userId: user, couponId } : { userId: user, id: id.value, dob: dob.value, couponId }
    const response = await fetch('/paypal', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    if (response.ok) {
        // hiding the coupon input when the payment is initialized
        document.querySelector('.coupon-input-row').classList.add('d-none')
        const { url, error } = await response.json()
        if (error) {
            showInputMessage(id, error)
            setPaypalLoading(false)
        }
        if (url) {
            window.location.href = url
        }
    } else {
        console.error(response)
    }
    function setPaypalLoading(isLoading) {
        if (isLoading) {
            paypalBtn.disabled = true;
            stripeBtn.disabled = true;
            document.querySelector("#spinner-paypal").classList.remove("d-none");
            paypalBtn.querySelector("#button-text").classList.add("d-none");
        } else {
            paypalBtn.disabled = false;
            stripeBtn.disabled = false;
            document.querySelector("#spinner-paypal").classList.add("d-none");
            paypalBtn.querySelector("#button-text").classList.remove("d-none");
        }
    }
})

couponBtn.addEventListener('click', async function (e) {
    const code = couponInput.value
    const discount = document.querySelector('.discount')//only discount price
    const discountRow = document.querySelector('.discount-row')//discount row 
    const discountPrice = discountRow.querySelector('.discount-price')//total price after discount
    if (code) {
        setLoading(true)
        const response = await fetch('/check-coupon', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, user })
        })
        setLoading(false)
        const result = await response.json();
        console.log(result)


        if (response.ok) {
            if (result.url) {
                new bootstrap.Modal('#coupon').show()
                setTimeout(() => {
                    window.location.href = result.url
                }, 3000)
            }
            if (result.error) {
                discountRow.classList.replace('d-table-row', 'd-none')
                discount.textContent = `\$0`;
                showMessage(result.error, "danger")
                couponId = undefined
            }
            if (result.success) {
                const { coupon: couponDetail, msg } = result.success
                const currentPrice = packageTotal
                if (couponDetail.discount == 100) {
                    document.querySelector('.btn-pay').classList.add('d-none')
                    document.querySelector('.btn-coupon-register').classList.remove('d-none')
                }
                // discount of the current price
                let discountInUSD = Number(currentPrice) * (Number(couponDetail.discount) / 100)
                // price after discount
                let calculatedPrice = Number(currentPrice) - discountInUSD

                showMessage(msg, 'success')
                couponId = couponDetail._id
                discount.textContent = `\$${discountInUSD.toFixed(2)}`;
                discountPrice.textContent = `\$${calculatedPrice}`;
                discountRow.classList.replace('d-none', 'd-table-row')
            }
        }
    } else {
        showMessage("Please enter the Coupon code.", "danger")
        discountRow.classList.replace('d-table-row', 'd-none')
        discount.textContent = `\$0`;
        couponId = undefined
    }

    function setLoading(isLoading) {
        if (isLoading) {
            couponBtn.disabled = true;
            couponBtn.querySelector('.text').classList.add('d-none');
            couponBtn.querySelector('.spinner').classList.remove('d-none')
        } else {
            couponBtn.disabled = false;
            couponBtn.querySelector('.text').classList.remove('d-none');
            couponBtn.querySelector('.spinner').classList.add('d-none')
        }
    }
    function showMessage(messageText, type = "danger") {
        const messageContainer = document.querySelector(".coupon-msg");

        messageContainer.classList.remove("opacity-0");
        messageContainer.classList.remove("text-danger");
        messageContainer.classList.remove("text-success");
        messageContainer.classList.add(`text-${type}`);
        messageContainer.textContent = messageText;

        // setTimeout(function () {
        //     messageContainer.classList.add("opacity-0");
        //     messageContainer.classList.replace(`text-${type}`, "text-danger");
        //     messageContainer.textContent = "no msg";
        // }, 4000);
    }
})
couponRegister.addEventListener('click', async function (e) {
    if (couponId) {
        setLoading(true)
        const response = await fetch('/register-coupon', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ couponId, user })
        })
        setLoading(false)
        const result = await response.json();
        console.log(result)


        if (response.ok) {
            console.log(result)
            if (result.url) {
                new bootstrap.Modal('#coupon').show()
                setTimeout(() => {
                    window.location.href = result.url
                }, 3000)
            }
            if (result.error) {
                showMessage(result.error, "danger")
            }
        }
    } else {
        showMessage("Please enter the Coupon code again.", "danger")
    }

    function setLoading(isLoading) {
        if (isLoading) {
            couponRegister.disabled = true;
            couponRegister.querySelector('.text').classList.add('d-none');
            couponRegister.querySelector('.spinner').classList.remove('d-none')
        } else {
            couponRegister.disabled = false;
            couponRegister.querySelector('.text').classList.remove('d-none');
            couponRegister.querySelector('.spinner').classList.add('d-none')
        }
    }
    function showMessage(messageText, type = "danger") {
        const messageContainer = document.querySelector(".coupon-reg-msg");

        messageContainer.classList.remove("opacity-0");
        messageContainer.classList.remove("text-danger");
        messageContainer.classList.remove("text-success");
        messageContainer.classList.add(`text-${type}`);
        messageContainer.textContent = messageText;
    }
})