const express = require('express')
const app = express()
const http = require('http')
const request = require('request')
const Stripe = require('stripe')
const bodyParser = require('body-parser')
const stripe = Stripe(process.env.STRIPE_SECRET || 'sk_test_NS6kWKJP3mD2gQ8lEYNlY8oR00wcBUhC5G')
const database = require('./database')

app.use(bodyParser.json())

app.get('/ping', function(request, response) {
  response.send('pong')
})

const errToJSON = ({ name, message, stack }) => ({ error: { name, message, stack } })

app.post('/setup_intents', async (req, res) => {
  try {
    const { options } = req.body
    const paymentIntent = await stripe.setupIntents.create(options)
    res.json(paymentIntent)
  } catch (err) {
    console.error('SetupIntent err', err)
    res.status(500).json(errToJSON(err))
  }
})

// Create appropriate plans in stripe dashboard
// https://stripe.com/docs/api/plans/create
const SUBSCRIPTION_PLAN = {
  items: [
    {
      plan: 'MF-RENT'
    }
  ],
  trial_period_days: 30
}







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
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      ...SUBSCRIPTION_PLAN
    })
    console.log('Created subscription', subscription)

    res.json({ subscription, paymentMethod })
  } catch (err) {
    console.error('SetupIntent err', err)
    res.status(500).json(errToJSON(err))
  }
})






app.use('/', function(req, res) {
  request('http://localhost:8000' + req.path)
    .on('error', err => {
      console.log('Error - middleware')
      console.log(err)
      const restartScript = "<script>setTimeout(() => location.href = '/', 200)</script>"
      return res.send('client not started yet, try refreshing in a few seconds' + restartScript)
    })
    .pipe(res)
})

var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})

// Keep glitch container alive
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
}, 2800)
