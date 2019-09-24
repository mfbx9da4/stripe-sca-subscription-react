const createSetupIntent = async (options) => {
  const res = await window
    .fetch('/setup_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({options}),
    })
  
  let data = null
  if (res.status === 200) {
    data = await res.json();
  }
  if (!data || data.error) {
    console.log('SetupIntents API error:', data);
    throw new Error('SetupIntents API Error');
  }
  return data.client_secret;  
};


const attachPaymentMethod = async (options) => {
  const res = await window
    .fetch('/attach_payment_method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({options}),
    })
  
  let data = null
  if (res.status === 200) {
    data = await res.json();
  }
  if (!data || data.error) {
    console.log('AttachPaymentMethod API error:', data);
    throw new Error('AttachPaymentMethod API Error');
  }
  return data;  
};


export default {
  createSetupIntent,
  attachPaymentMethod
};