// A Fake Database - most likely you will have a real DB
// where you should store the customerID
const IN_MEMORY_STORE = {
  'david@crowdform.co.uk': 'cus_FryyQPnDdAkI7V'
}

const Database = {
  loadCustomerId: email => IN_MEMORY_STORE[email],
  storeCustomerId: (email, customerId) => {
    IN_MEMORY_STORE[email] = customerId
  }
}

module.exports = Database