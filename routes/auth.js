// https://github.com/ForgeRock/exampleOAuth2Clients

var express = require('express');
var router = express.Router();

var passport = require('passport');
var OidcStrategy = require('passport-openidconnect').Strategy;


// Accept the OpenID identifier and redirect the user to their OpenID
// provider for authentication.  When complete, the provider will redirect
// the user back to the application at:
//     /auth/openid/return
router.get('/openid', passport.authenticate('openidconnect'));

// The OpenID provider has redirected the user back to the application.
// Finish the authentication process by verifying the assertion.  If valid,
// the user will be logged in.  Otherwise, authentication has failed.
router.get('/openid/return',
    passport.authenticate('openidconnect', {
        successRedirect: '/users',
        failureRedirect: '/'
    }));


/// http://idp5.canadacentral.cloudapp.azure.com/opensso/oauth2/.well-known/openid-configuration
var openAM = {
    // make sure "Client Type: Confidential" & "Token Endpoint Auth Method: client_secret_post"
    issuer: "http://idp5.canadacentral.cloudapp.azure.com:80/opensso/oauth2",
    authorizationURL: "http://idp5.canadacentral.cloudapp.azure.com:80/opensso/oauth2/authorize",
    tokenURL: "http://idp5.canadacentral.cloudapp.azure.com:80/opensso/oauth2/access_token",
    userInfoURL: "http://idp5.canadacentral.cloudapp.azure.com:80/opensso/oauth2/userinfo",
    clientID: "localhost:3000",
    clientSecret: "testtest",
    callbackURL: "/auth/openid/return",
    scope: 'openid profile'
};

// https://bugster.forgerock.org/jira/browse/OPENAM-11340
// {"realm":"/","transactionId":"61d4286c-5a70-4ce7-a994-9b3a592d8e46-342195","userId":"id=test0001,ou=user,dc=openam,dc=forgerock,dc=org","timestamp":"2019-11-17T14:04:37.946Z","eventName":"AM-ACCESS-OUTCOME","component":"OAuth","response":{"status":"SUCCESSFUL","statusCode":"","elapsedTime":14,"elapsedTimeUnits":"MILLISECONDS"},"client":{"ip":"174.116.37.8","port":57248},"server":{"ip":"10.0.5.13","port":80},"http":{"request":{"secure":false,"method":"POST","path":"http://idp5.canadacentral.cloudapp.azure.com/opensso/oauth2/authorize","queryParameters":{"response_type":["code"],"client_id":["localhost%3A3000"],"scope":["openid%20openid%20profile"],"state":["n1Mu6mPaPg4kLRoQ6wQbkN7w"]},"headers":{"accept":["text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"],"host":["idp5.canadacentral.cloudapp.azure.com"],"origin":["http://idp5.canadacentral.cloudapp.azure.com"],"referer":["http://idp5.canadacentral.cloudapp.azure.com/opensso/oauth2/authorize?response_type=code&client_id=localhost%3A3000&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fopenid%2Freturn&scope=openid%20openid%20profile&state=n1Mu6mPaPg4kLRoQ6wQbkN7w"],"upgrade-insecure-requests":["1"],"user-agent":["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"]},"cookies":{"JSESSIONID":"154E3AAA3A0BD1D315BECDAE2CB77B97","amlbcookie":"01"}}},"trackingIds":["61d4286c-5a70-4ce7-a994-9b3a592d8e46-341029","61d4286c-5a70-4ce7-a994-9b3a592d8e46-342196"],"_id":"61d4286c-5a70-4ce7-a994-9b3a592d8e46-342201"}
// {"realm":"/","transactionId":"61d4286c-5a70-4ce7-a994-9b3a592d8e46-342204","timestamp":"2019-11-17T14:04:38.065Z","eventName":"AM-ACCESS-OUTCOME","component":"OAuth","response":{"status":"FAILED","statusCode":"400","elapsedTime":2,"elapsedTimeUnits":"MILLISECONDS","detail":{"reason":"The request could not be understood by the server due to malformed syntax"}},"client":{"ip":"174.116.37.8","port":57249},"server":{"ip":"10.0.5.13","port":80},"http":{"request":{"secure":false,"method":"POST","path":"http://idp5.canadacentral.cloudapp.azure.com/opensso/oauth2/access_token","queryParameters":{},"headers":{"host":["idp5.canadacentral.cloudapp.azure.com:80"],"user-agent":["Node-oauth"]},"cookies":{}}},"_id":"61d4286c-5a70-4ce7-a994-9b3a592d8e46-342206"}



// https://dev-qleyxbz4.auth0.com/oauth2/.well-known/openid-configuration
// https://manage.auth0.com/dashboard/us/dev-qleyxbz4/
var openIdConnect = {
    issuer: "https://dev-qleyxbz4.auth0.com/",
    authorizationURL: "https://dev-qleyxbz4.auth0.com/authorize",
    tokenURL: "https://dev-qleyxbz4.auth0.com/oauth/token",
    userInfoURL: "https://dev-qleyxbz4.auth0.com/userinfo",
    clientID: "rOgSvi2f5zZxIXubByi10aJWpMwA64Ch",
    clientSecret: "9VXF5lKE0GpIwYBazOHJ82wZO6O1DEoRLLnzhqY3C38_5MAqx5NnpKGwqApM3aUO",
    callbackURL: "/auth/openid/return",
    scope: 'openid profile email phone address'
};


/*
  Example: configuring a new passport-openidconnect (https://github.com/jaredhanson/passport-openidconnect) strategy
  with the ForgeRock platform specific parameters, including the well-known endpoints,
  which can be obtained from the OpenID Provider Configuration Document:
  https://default.iam.example.com/am/oauth2/.well-known/openid-configuration
*/
passport.use(new OidcStrategy(openAM, function (issuer, sub, profile, jwtClaims, accessToken, refreshToken, tokenResponse, done) {
    /*
      tokens received from the token endpoint after successful authentication and authorization
      are saved for future use by passing the information received from the OP to the next handler
      in a single object provided as the second argument to the `done` method,
      allowing Passport to attach it to the request object (and to preserve it in the session), e.g.:
    */
    done(null, {
        tokens: tokenResponse,
        public: {
            profile: profile,
            issuerInfo: {
                issuer: issuer
            },
            tokenInfo: {
                scope: tokenResponse.scope,
                token_type: tokenResponse.token_type,
                expires_in: tokenResponse.expires_in,
                claims: {
                    iat: jwtClaims.iat,
                    exp: jwtClaims.exp
                }
            }
        }
    });
}));

module.exports = router;
