import React from 'react';
import {render} from 'react-dom';
import {
  CardElement,
  Elements,
  injectStripe,
} from 'react-stripe-elements';
import { withStripe } from './withStripe'
import api from './api';
// eslint-disable-next-line
import style from './index.css'

const handleBlur = () => {
  console.log('[blur]');
};
const handleChange = (change) => {
  console.log('[change]', change);
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleReady = () => {
  console.log('[ready]');
};

const createOptions = (fontSize, padding) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        ...(padding ? {padding} : {}),
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

class _CardForm extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null,
  };

  async componentDidMount() {
    try {
      let clientSecret = await api.createSetupIntent({
          payment_method_types: ['card'],
        })
      this.setState({clientSecret, disabled: false})  
    } catch(err) {
      this.setState({error: err.message})
    }
  }
  
  handleSubmit = async (ev) => {
    ev.preventDefault();
    this.setState({disabled: true, processing: true});
    const paymentMethod = await this.getPaymentMethod()
    return this.attachPaymentMethod(paymentMethod)
  };
  
  attachPaymentMethod = async (paymentMethod) => {
    const attached = await api.attachPaymentMethod({paymentMethod, email: "david@crowdform.co.uk"})
    console.log('attache', attached)
    this.setState({
      succeeded: true,
      message: `Subscription started!`,
    });
  }

  getPaymentMethod = async () => {
    const payload = await this.props.stripe
      .handleCardSetup(this.state.clientSecret)
    if (payload.error) {
      console.log('[error]', payload.error);
      this.setState({
        error: `Setup failed: ${payload.error.message}`,
        disabled: false,
      });
      return null
    }
    console.log('[SetupIntent]', payload.setupIntent);
    this.setState({
      message: `Setup succeeded! SetupIntent is in state: ${
        payload.setupIntent.status
      }`,
    });
    return payload.setupIntent.payment_method
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Use 4000002500003155 to test 3D secure. <a href='https://stripe.com/docs/testing#testing'>More cards</a>.
        </label>
        
        <CardElement
          hidePostalCode
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onReady={handleReady}
          {...createOptions(this.props.fontSize)}
        />
        
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Start trial'}
          </button>
        )}
      </form>
    );
  }
}

const CardForm = injectStripe(_CardForm);

class _Checkout extends React.Component {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({elementFontSize: '14px'});
      } else if (
        window.innerWidth >= 450 &&
        this.state.elementFontSize !== '18px'
      ) {
        this.setState({elementFontSize: '18px'});
      }
    });
  }

  render() {
    const {elementFontSize} = this.state;
    return (
      <div className="Checkout">
        <h1>React Stripe Elements Subscription with SCA</h1>
        <Elements>
          <CardForm fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}

const Checkout = withStripe(_Checkout)

const App = () => {
  return (
    <Checkout />
  );
};

const appElement = document.querySelector('#root');
if (appElement) {
  render(<App />, appElement);
} else {
  console.error(
    'We could not find an HTML element with a class name of "App" in the DOM. Please make sure you copy index.html as well for this demo to work.'
  );
}