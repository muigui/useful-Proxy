chai     = require( 'chai' );
Proxy    = require( '../index' );
expect   = chai.expect;

require( 'useful-Proxy/lib/transport/jQuery' );
require( 'useful-Proxy/lib/transport/superagent' );

require( './Proxy.test.js' );
require( './Proxy.Ajax.test.js' );

