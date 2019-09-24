import React from 'react';
import {render} from 'react-dom';
import {
  CardElement,
  Elements,
  injectStripe,
} from 'react-stripe-elements';
import { withStripe } from './withStripe'
import api from './api';
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

class _CreatePaymentMethod extends React.Component {
  state = {
    error: null,
    processing: false,
    message: null,
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe.createPaymentMethod('card').then((payload) => {
        if (payload.error) {
          this.setState({
            error: `Failed to create PaymentMethod: ${payload.error.message}`,
            processing: false,
          });
          console.log('[error]', payload.error);
        } else {
          this.setState({
            message: `Created PaymentMethod: ${payload.paymentMethod.id}`,
            processing: false,
          });
          console.log('[paymentMethod]', payload.paymentMethod);
        }
      });
      this.setState({processing: true});
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.createPaymentMethod
          <CardElement
            hidePostalCode
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        <button disabled={this.state.processing}>
          {this.state.processing ? 'Processing…' : 'Create'}
        </button>
      </form>
    );
  }
}

const CreatePaymentMethod = injectStripe(_CreatePaymentMethod);

class _HandleCardPayment extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null,
  };

  async componentDidMount() {
    let res = await fetch('/ping')
    let body = await res.text()
    this.setState({body})
    api.createPaymentIntent({
        amount: 1099,
        currency: 'usd',
        payment_method_types: ['card'],
      })
      .then((clientSecret) => {
      console.log(clientSecret)
        this.setState({clientSecret, disabled: false});
      })
      .catch((err) => {
        this.setState({error: err.message});
      });

  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .handleCardPayment(this.state.clientSecret)
        .then((payload) => {
          if (payload.error) {
            this.setState({
              error: `Charge failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Charge succeeded! PaymentIntent is in state: ${
                payload.paymentIntent.status
              }`,
            });
            console.log('[PaymentIntent]', payload.paymentIntent);
          }
        });
      this.setState({disabled: true, processing: true});
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.handleCardPayment
          <CardElement
            hidePostalCode
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        <div className="message">body{JSON.stringify(this.state.body, null, 2)}</div>
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Pay'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardPayment = injectStripe(_HandleCardPayment);

class _HandleCardSetup extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null,
  };

  componentDidMount() {
    api
      .createSetupIntent({
        payment_method_types: ['card'],
      })
      .then((clientSecret) => {
        this.setState({clientSecret, disabled: false});
      })
      .catch((err) => {
        this.setState({error: err.message});
      });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .handleCardSetup(this.state.clientSecret)
        .then((payload) => {
          if (payload.error) {
            this.setState({
              error: `Setup failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Setup succeeded! SetupIntent is in state: ${
                payload.setupIntent.status
              }`,
            });
            console.log('[SetupIntent]', payload.setupIntent);
          }
        });
      this.setState({disabled: true, processing: true});
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.handleCardSetup
          <CardElement
            hidePostalCode
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Setup'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardSetup = injectStripe(_HandleCardSetup);

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
        <h1>React Stripe Elements with PaymentIntents</h1>
        <Elements>
          <CreatePaymentMethod fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardPayment fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardSetup fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}

const Checkout = withStripe(_Checkout)

const App = () => {
  return (
    <div>
      Stripe checkout
      <Checkout />
    </div>
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