class _CardForm extends React.Component {
  state = {
    clientSecret: null,
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null
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

  handleSubmit = async ev => {
    ev.preventDefault()
    this.setState({ disabled: true, processing: true })
    const paymentMethod = await this.getPaymentMethod()
    return this.attachPaymentMethod(paymentMethod)
  }
  
  getPaymentMethod = async () => {
    const payload = await this.props.stripe.handleCardSetup(this.state.clientSecret)
    if (payload.error) {
      console.log('[error]', payload.error)
      this.setState({
        error: `Setup failed: ${payload.error.message}`,
        disabled: false
      })
      return null
    }
    console.log('[SetupIntent]', payload.setupIntent)
    this.setState({
      message: `Setup succeeded! SetupIntent is in state: ${payload.setupIntent.status}`
    })
    return payload.setupIntent.payment_method
  }

  attachPaymentMethod = async paymentMethod => {
    const attached = await api.attachPaymentMethod({
      paymentMethod,
      email: 'david@crowdform.co.uk'
    })
    console.log('attache', attached)
    this.setState({
      succeeded: true,
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

        <CardElement
          hidePostalCode
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onReady={handleReady}
          {...createOptions(this.props.fontSize)}
        />

        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && <div className="message">{this.state.message}</div>}

        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Start trial'}
          </button>
        )}
      </form>
    )
  }
}

const CardForm = injectStripe(_CardForm)