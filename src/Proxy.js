	function Proxy( config ) {
		copy( this, config || {} );

		Super.call( this );

		this.init();
	}

	Proxy.prototype = copy( Object.create( Super.prototype ), {
		constructor : Proxy,
// instance configuration
		defaults    : null,
// public properties
		disabled    : false,
// internal properties
// public methods
		disable     : function() {
			if ( !this.disabled && this.broadcast( 'before:disable' ) !== false ) {
				this.disabled = true;

				this.onDisable();

				this.broadcast( 'disable' );
			}

			return this;
		},
		enable      : function() {
			if ( this.disabled && this.broadcast( 'before:enable' ) !== false ) {
				this.disabled = false;

				this.onEnable();

				this.broadcast( 'enable' );
			}

			return this;
		},
		interactive : function() {
			return !this.disabled;
		},
		load        : function ( data ) {
			var args = Array.prototype.slice.call( arguments );

			args.unshift( 'before:load' );

			if ( this.interactive() && this.broadcast.apply( this, args ) !== false ) {
				args.shift();

				this.onLoadStart.apply( this, args );
			}

			return this;
		},
// stub methods
		onDisable   : function() {},
		onEnable    : function() {},
		onLoad      : function( data ) {
			var args = Array.prototype.slice.call( arguments );

			args.unshift( 'load' );

			this.broadcast.apply( this, args );

			return this;
		},
		onLoadStart : function( data ) {
			return this.onLoad( this.prepareData( data ) );
		},
		prepareData : function( data ) {
			return copy( data || {}, this.defaults.data, true );
		},
// internal methods
// constructor/destructor methods
		init        : function() {
			var defaults = this.defaults;

			if ( !defaults )
				this.defaults = {};
			else
				if ( typeof defaults !== 'object' || !( 'data' in defaults ) )
					this.defaults = { data : defaults };
		}
	} );