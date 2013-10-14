	module.exports = Object.create( {
		abort     : function( request ) {
			return request ? !!request.abort() || true : false;
		},
		init      : function( transport ) {
			if ( !( 'type' in transport ) && 'method' in transport )
				transport.type = transport.method;

			transport.error   = this.onError;
			transport.success = this.onLoad;

			return transport;
		},
		onError   : function( err, status, xhr ) {
			var proxy = this.proxy,
				args  = proxy.args.slice();

			args.unshift( err );
			args.push( xhr );

			proxy.error.apply( proxy.ctx, args );

			return proxy;
		},
		onLoad    : function( data, status, xhr ) {
			var proxy = this.proxy,
				args  = proxy.args.slice();

			args.unshift( data );
			args.push( xhr );

			proxy.success.apply( proxy.ctx, args );

			return proxy;
		},
		send      : function( transport ) {
			var req  = $.ajax( transport );

			req.proxy = transport.proxy;

			return req;
		}
	} );