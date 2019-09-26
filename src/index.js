import React from 'react'
import { render } from 'react-dom'
import { CardElement, Elements, injectStripe } from 'react-stripe-elements'
import { withStripe } from './withStripe'
import PropTypes from 'prop-types'
import api from './api'
// eslint-disable-next-line
import style from './index.css'

const handleBlur = () => {
  console.log('[blur]')
}
const handleChange = change => {
  console.log('[change]', change)
}
const handleFocus = () => {
  console.log('[focus]')
}
const handleReady = () => {
  console.log('[ready]')
}

const createOptions = (fontSize, padding) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4'
        },
        ...(padding ? { padding } : {})
      },
      invalid: {
        color: '#9e2146'
      }
    }
  }
}

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
};

const Card = injectStripe(_SCACardElement)

class _CardForm extends React.Component {
  state = {
    error: null,
    disabled: false,
    succeeded: false,
    processing: false,
    message: null
  }

  handleSubmit = async ev => {
    ev.preventDefault()
    console.log('submit')
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
          <button type='submit' disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Start trial'}
          </button>
        )}
      </form>
    )
  }
}


const CardForm = _CardForm

class _Checkout extends React.Component {
  constructor() {
    super()
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px'
    }
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({ elementFontSize: '14px' })
      } else if (window.innerWidth >= 450 && this.state.elementFontSize !== '18px') {
        this.setState({ elementFontSize: '18px' })
      }
    })
  }

  render() {
    const { elementFontSize } = this.state
    return (
      <div className="Checkout">
        <h1>React Stripe Elements Subscription with SCA</h1>
        <Elements>
          <CardForm fontSize={elementFontSize} />
        </Elements>
      </div>
    )
  }
}

const Checkout = withStripe(_Checkout)

const App = () => {
  return <Checkout />
}

const appElement = document.querySelector('#root')
if (appElement) {
  render(<App />, appElement)
} else {
  console.error(
    'We could not find an HTML element with a class name of "App" in the DOM. Please make sure you copy index.html as well for this demo to work.'
  )
}
