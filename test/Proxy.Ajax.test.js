
suite( 'muigui/useful-Proxy.Ajax', function() {
	function fail( method_name ) {
		expect( 'Proxy.Ajax#' + method_name ).not.to.be.ok;
	}

	function pass( method_name ) {
		expect( 'Proxy.Ajax#' + method_name ).to.be.ok;
	}

	var test_url = 'data/proxy-ajax.json';

	suite( 'transport: jQuery', function() {
		Proxy.Ajax.transport = require( 'useful-Proxy/lib/transport/jQuery' );

		suite( '#interactive', function() {
			var proxy = new Proxy.Ajax( { urlBase : test_url } );

			test( '#interactive returns true if the proxy is not disabled', function( done ) {
				proxy.enable();

				expect( proxy.interactive() ).to.be.true;

				done();
			} );

			test( '#interactive returns false if the proxy is disabled', function( done ) {
				proxy.disable();

				expect( proxy.interactive() ).to.be.false;

				done();
			} );
		} );

		suite( '#disable', function() {
			this.slow( 750 );

			var proxy = new Proxy.Ajax( { urlBase : test_url } ),
				fail_ = fail.bind( null, 'disable' ),
				pass_ = pass.bind( null, 'disable' );

			proxy.disable();
			proxy.on( 'load:start', fail_ );

			test( '#disable should stop a proxy from requesting data when called with the #load method', function( done ) {
				this.timeout( proxy.timeout );

				proxy.load();

				setTimeout( function() {
					pass_();

					done();
				}, 350 );
			} );

			test( '#disable should stop a proxy from requesting data when called with the #reload method', function( done ) {
				this.timeout( proxy.timeout );

				proxy.reload();

				setTimeout( function() {
					pass_();

					proxy.ignore( 'loadstart', fail_ );

					done();
				}, 350 );
			} );
		} );

		suite( '#enable', function() {
			var proxy = new Proxy.Ajax( { urlBase : test_url } ),
				pass_ = pass.bind( null, 'enable' );

			test( '#enable should allow a proxy to load data using its #load method', function( done ) {
				this.timeout( proxy.timeout );

				proxy.once( 'before:load', pass_ );

				expect( proxy.disable().interactive() ).to.be.false;
				expect( proxy.enable().interactive() ).to.be.true;

				proxy.once( 'before:load', function() {
					done();
				} ).load();
			} );

			test( '#enable should allow a proxy to load data using its #reload method', function( done ) {
				this.timeout( proxy.timeout );

				proxy.once( 'before:reload', pass_ );

				expect( proxy.disable().interactive() ).to.be.false;
				expect( proxy.enable().interactive() ).to.be.true;

				proxy.once( 'before:reload', function() {
					done();
				} ).reload();
			} );
		} );

		suite( '#[re]load', function() {
			var proxy = new Proxy.Ajax( { urlBase : test_url } ),
				data  = { foo : 'bar', bar : 'foo' };

			test( '#load', function( done ) {
				this.timeout( proxy.timeout );

				proxy.once( 'load', function( p, data ) {
					expect( data ).to.eql( { success : true } );

					done();
				} );

				proxy.load();
			} );

			test( '#load should request data via an XHR based on the proxy\'s default options and passed parameters', function( done ) {
				proxy.enable().once( 'load:start', function() {
					this.abort();

					expect( this.lastOptions.type ).to.equal( 'POST' );
					expect( this.lastOptions.data ).to.eql( data );
					expect( this.lastOptions.url ).to.equal( this.urlBase );

					done();
				} ).load( data, 'post' );
			} );

			test( '#reload should request data via an XHR using the proxy\'s lastOptions', function( done ) {
				proxy.enable().once( 'load:start', function() {
					this.abort();

					expect( this.lastOptions.type ).to.equal( 'POST' );
					expect( this.lastOptions.data ).to.eql( data );
					expect( this.lastOptions.url ).to.equal( this.urlBase );

					done();
				} ).reload( [1,2,3], 'get' );
			} );
		} );

		suite( '#abort', function() {
			var proxy = new Proxy.Ajax( { urlBase : test_url } ),
				fail_ = fail.bind( expect, 'abort' ), pass_ = pass.bind( expect, 'abort' );

			test( '#abort should stop the execution of the proxy\'s current request', function( done ) {
				proxy.once( 'abort', function() {
					pass_();

					done();

					this.purgeObservers();
				} ).once( 'load', fail_ ).once( 'load:start', proxy.abort ).load();
			} );
		} );
	} );
} );
