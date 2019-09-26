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

### Prerequisites

1. Upgrade to latest version of stripe in the dashboard. `2019-09-09` or later.

![Upgraded stripe version](https://user-images.githubusercontent.com/1690659/65693247-e6370a00-e06b-11e9-96b5-53c9e5c129f0.png)


2. Use the latest version of `stripe` nodejs library.

```
npm uninstall stripe -S ; npm install stripe -S
# or if you use yarn 
yarn remove stripe ; yarn add stripe 
```
 
3. Use latest version of `react-stripe-elements`.

```
npm uninstall react-stripe-elements -S ; npm install react-stripe-elements -S
# or if you use yarn 
yarn remove react-stripe-elements ; yarn add react-stripe-elements 
```

4. Use latest version of client side stripe. If you are already using stripe make sure to update it. If you are starting fresh, we'll include it later in the tutorial, so don't worry about including it now!

```
<script src="https://js.stripe.com/v3/"></script>
```

5. In the dashboard, [create a subscription plan](https://stripe.com/docs/billing/subscriptions/creating) or [do it programmatically](https://stripe.com/docs/api/subscriptions). 
If you have a subscription it should look a bit like this in the dashboard. Jot down the `ID` shown in the image for later.

![dashboard subscription](https://user-images.githubusercontent.com/1690659/65694524-e9cb9080-e06d-11e9-8433-8a42407ce361.png)


### Activate SCA


1. Setup the intent

2. Authenticate with 3D secure
3. Attach payment method to customer
4. Start subscription


