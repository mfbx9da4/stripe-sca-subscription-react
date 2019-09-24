// Fake methods - most likely you will have a real DB
// where you should store the customerID
const IN_MEMORY_STORE = {
  'david@crowdform.co.uk': 'cus_FryyQPnDdAkI7V'
}

export const loadCustomerId = email => {
  return IN_MEMORY_STORE[email]
}

export const storeCustomerId = (email, customerId) => {
  IN_MEMORY_STORE[email] = customerId
}
