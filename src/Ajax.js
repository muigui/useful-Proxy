	function Ajax( config ) {
		Proxy.call( this, config );
	}

	Ajax.prototype = function( __proto__ ) {
		return copy( Object.create( __proto__ ), {
			constructor     : Ajax,
// instance configuration
			method          : 'GET',
			timeout         : 10000,
			urlBase         : null,
// public properties
// internal properties
			current         : null,
			lastOptions     : null,
// public methods
			abort           : function( silent ) {
				if ( Ajax.transport.abort( this.current ) )
					this.onAbort( silent );

				return this;
			},
			reload          : function() {
				if ( this.lastOptions && this.interactive() && this.broadcast( 'before:reload' ) !== false ) {
					var transport = this.lastOptions,
						request   = transport.proxy;

					this.doRequest( request.data, transport.method, request.args );
				}

				return this;
			},
			send            : function( transport ) {
				this.current = Ajax.transport.send( this.lastOptions );

				this.broadcast( 'load:start', this.current );

				return this.current;
			},
			toQueryParams   : function( params ) {
				if ( !params || typeof params !== 'object' )
					return '';

				return '?' + Object.keys( params ).reduce( function( qs, key ) {
					var qk = '&' + encodeURI( key ) + '=';

					return qs + qk + ( Array.isArray( params[key] )
						 ? params[key].map( encodeURI ).join( '&' + qk )
						 : encodeURI( params[key] ) );
				}, '' ).substring( 1 )
			},
// stub methods
			createUrl       : function ( params, method ) {
				method = method || this.method;

				return this.urlBase + ( method === 'GET' ? this.toQueryParams( params ) : '' );
			},
			onAbort         : function( silent ) {
				if ( silent !== true )
					this.broadcast( 'abort', this.current );
			},
			onBeforeLoad    : function() {
				!this.current || this.abort( true );
			},
			onError         : function() {
				var args = Array.prototype.slice.call( arguments );

				args.unshift( 'error' );

				this.broadcast.apply( this, arguments );

				return this;
			},
			onLoad          : function() {
				var args = Array.prototype.slice.call( arguments );

				args.unshift( 'load' );

				this.broadcast.apply( this, args );

				return this;
			},
			onLoadStart     : function( data, method, args ) {
				if ( Array.isArray( method ) )
					args = method;

				method  = this.resolveMethod( method );

				this.doRequest( data, method, args );
			},
// internal methods
			doRequest       : function( data, method, args ) {
				var url          = this.createUrl( data, method );

				this.lastOptions = this.initTransport( url, method, data, args );

				return this.send( this.lastOptions );
			},
			initTransport   : function( url, method, data, args ) {
				var transport = {
					headers : this.defaults.headers,
					method  : method || this.method,
					proxy   : {
						args    : Array.isArray( args ) ? args : [],
						ctx     : this,
						data    : data,
						error   : this.onError,
						success : this.onLoad
					},
					timeout : this.timeout,
					url     : url
				};

	 // if not a put or a post your createURL over-write should turn data into query string params
				if ( method === 'POST' || method === 'PUT' )
					transport.data = data;

				return Ajax.transport.init( transport );
			},
			removeTransport : function() {
				!this.current || delete this.current;
			},
			resolveMethod   : function( method ) {
				if ( !method || typeof method != 'string' )
					method = this.method || 'GET';

				return method.toUpperCase();
			},
// constructor/destructor methods
			init            : function() {
				__proto__.init.call( this );

				var cleanups = ['onBeforeLoad', 'removeTransport'],
					defaults = this.defaults;

				if ( !defaults.headers || typeof defaults.headers !== 'object' )
					defaults.headers = {};

				this.observe( {
					 abort          : 'removeTransport',
					'before:load'   :  cleanups,
					'before:reload' :  cleanups,
					 error          : 'removeTransport',
					 load           : 'removeTransport',
					 ctx            :  this
				} );
			}
		} );

	}( Proxy.prototype );