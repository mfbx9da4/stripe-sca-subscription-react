# Stripe SCA Subscriptions Example

To demo how to implement stripe SCA using react and node.

> [VIEW DEMO](https://stripe-sca-subscription-react.glitch.me)

> [EDIT ON GLITCH](https://glitch.com/edit/#!/stripe-sca-subscription-react)

> [MIRROR ON GITHUB](https://github.com/mfbx9da4/stripe-sca-subscription-react)

![edAUunAs5S](https://user-images.githubusercontent.com/1690659/65525116-e8bc2700-dee6-11e9-814f-96ece40653cd.gif)

### Aim

- A step by step guide for integrating Stripe in an SCA compliant way for subscriptions.
- If you just want a template project to copy, [you can see a live demo and fork the code here](https://glitch.com/edit/#!/stripe-sca-subscription-react).
- Stripe React Elements github repository also has some [demo code](https://github.com/stripe/react-stripe-elements/tree/master/demo/intents) 
which I made into a [working example here](https://glitch.com/edit/#!/stripe-react-elements-express).

### Overview

Prerequisites
1. Upgrade stripe
2. Upgrade stripejs (server)
3. Upgrade stripe-react-elements
4. Upgrade stripejs (web)
5. Create subscriptions in dashboard

Integrate Stripe
1. Setup the intent
2. Authenticate with 3D secure
3. Attach payment method to customer
4. Start subscription

TODO: Include links from overview

### Prerequisites

1. Upgrade to latest version of stripe in the dashboard. `2019-09-09` or later.

![Upgraded stripe version](https://user-images.githubusercontent.com/1690659/65693247-e6370a00-e06b-11e9-96b5-53c9e5c129f0.png)


2. Use the latest version of `stripe` nodejs library.

```bash
npm uninstall stripe -S ; npm install stripe -S
# or if you use yarn 
yarn remove stripe ; yarn add stripe 
```
 
3. Use latest version of `react-stripe-elements`.

```bash
npm uninstall react-stripe-elements -S ; npm install react-stripe-elements -S
# or if you use yarn 
yarn remove react-stripe-elements ; yarn add react-stripe-elements 
```

4. Use latest version of client side stripe. If you are already using stripe make sure to update it. If you are starting fresh, we'll include it later in the tutorial, so don't worry about including it now!

```html
<script src="https://js.stripe.com/v3/"></script>
```

5. In the dashboard, [create a subscription plan](https://stripe.com/docs/billing/subscriptions/creating) or [do it programmatically](https://stripe.com/docs/api/subscriptions). 
If you have a subscription it should look a bit like this in the dashboard. Jot down the `ID` shown in the image for later.

![dashboard subscription](https://user-images.githubusercontent.com/1690659/65694524-e9cb9080-e06d-11e9-8433-8a42407ce361.png)


### Activate SCA

It requires these four steps

1. Setup the intent
2. Authenticate with 3D secure
3. Attach payment method to customer
4. Start subscription


----

#### 1. Setup the intent

#### 1a. Setup the intent (react)

Let's create a reusable CardElement which will always use SCA.
```js
class _SCACardElement extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clientSecret: null,
      error: null
    }
    // We expose this so that when the form is submitted we can
    // do 3D Secure from the parent 
    props.getHandleCardSetupRef(this.handleCardSetup)
  }

  async componentDidMount() {
    try {
      let clientSecret = await api.createSetupIntent({
        payment_method_types: ['card']
      })
      this.setState({ clientSecret, disabled: false })
    } catch (err) {
      this.setState({ error: err.message })
    }
  }
  
  handleCardSetup = async () => this.props.stripe.handleCardSetup(this.state.clientSecret)

  render() {
    const { error } = this.state
    return (
        <React.Fragment>
          <CardElement
            hidePostalCode
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        {error && <div className='error' key='SetupIntentError'>Setup Intent Error: {error}</div>}
      </React.Fragment>
    )
  }
}

_SCACardElement.propTypes = {
  getHandleCardSetupRef: PropTypes.func.isRequired
}

const Card = injectStripe(_SCACardElement)
```

#### 1b. Setup the intent (server)

Re

```js
app.post('/setup_intents', async (req, res) => {
  try {
    const { options } = req.body
    const intent = await stripe.setupIntents.create(options)
    res.json(intent)
  } catch (err) {
    console.error('SetupIntent err', err)
    res.status(500).json(errToJSON(err))
  }
})
```

#### 2. Authenticate with 3D secure

On submit of the form we call `handlCardSetup` to trigger the SCA modal. A successful `handleCardSetup`
will get us a `paymentMethodId`.

```js
class _CardForm extends React.Component {
  state = {
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null
  }

  handleSubmit = async ev => {
    ev.preventDefault()
    this.setState({ disabled: true, processing: true })
    const paymentMethodId = await this.handleCardSetup()
    // Do something with the paymentMethodId ...
  }
  
  handleCardSetup = async () => {
    const payload = await this.handleCardSetupRef()
    if (payload.error) {
      console.log('Handle Card Setup error', payload.error)
      return this.setState({
        error: `Handle Card Setup failed: ${payload.error.message}`,
        disabled: false
      })
    }
    console.log('Setup intent', payload.setupIntent)
    this.setState({
      message: `Setup succeeded! SetupIntent is in state: ${payload.setupIntent.status}`,
      error: null
    })
    return payload.setupIntent.payment_method
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Use 4000002500003155 to test 3D secure.{' '}
          <a href="https://stripe.com/docs/testing#testing">More cards</a>.
        </label>

        <Card getHandleCardSetupRef={ref => this.handleCardSetupRef = ref} />

        {this.state.error && <div key='error' className="error">{this.state.error}</div>}
        {this.state.message && <div key='message' className="message">{this.state.message}</div>}

        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Start trial'}
          </button>
        )}
      </form>
    )
  }
}
```

#### 3. Attach payment method to customer

Now that we have our `paymentMethodId` we can attach it to the user and start the subscription.

```js
class _CardForm extends React.Component {
  state = {
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null
  }

  handleSubmit = async ev => {
    ev.preventDefault()
    this.setState({ disabled: true, processing: true })
    const paymentMethodId = await this.handleCardSetup()
    if (paymentMethodId) return this.attachPaymentMethod(paymentMethodId)
  }
  
  handleCardSetup = async () => {
    const payload = await this.handleCardSetupRef()
    if (payload.error) {
      console.log('Handle Card Setup error', payload.error)
      return this.setState({
        error: `Handle Card Setup failed: ${payload.error.message}`,
        disabled: false
      })
    }
    console.log('Setup intent', payload.setupIntent)
    this.setState({
      message: `Setup succeeded! SetupIntent is in state: ${payload.setupIntent.status}`,
      error: null
    })
    return payload.setupIntent.payment_method
  }
  
  attachPaymentMethod = async paymentMethod => {
    // Email hard coded for demo!
    const attached = await api.attachPaymentMethod({
      email: 'david@crowdform.co.uk',
      paymentMethod
    })
    console.log('Attached', attached)
    this.setState({
      succeeded: true,
      error: null,
      message: `Subscription started!`
    })
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Use 4000002500003155 to test 3D secure.{' '}
          <a href="https://stripe.com/docs/testing#testing">More cards</a>.
        </label>

        <Card getHandleCardSetupRef={ref => this.handleCardSetupRef = ref} />

        {this.state.error && <div key='error' className="error">{this.state.error}</div>}
        {this.state.message && <div key='message' className="message">{this.state.message}</div>}

        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Start trial'}
          </button>
        )}
      </form>
    )
  }
}
```

#### 4. Start subscription

We can use this payment method to create the subscription after we have attached it to the user. 

```js
app.post('/attach_payment_method', async (req, res) => {
  try {
    const { email, paymentMethod: paymentMethodId } = req.body.options

    // Step 1
    // Get or create the stripe customer
    let customerId = database.loadCustomerId(email)
    if (!customerId) {
      const customer = await stripe.customers.create({ email })
      console.log('Created new customer', customer)
      customerId = customer.id
      // In production you should store the newly created customerId
      // on the user model in your DB
      database.storeCustomerId(email, customerId)
    }

    // Step 2
    // Attach the payment method
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })
    console.log('Attached Payment Method', paymentMethod)

    // Step 3
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      tax_percent: 0,
      ...SUBSCRIPTION_PLAN
    })
    console.log('Created subscription', subscription)

    res.json({ subscription, paymentMethod })
  } catch (err) {
    console.error('SetupIntent err', err)
    res.status(500).json(errToJSON(err))
  }
})
```
