import {
	get,
	setProperties,
	computed,
	inject,
	observer,
	Mixin
} from "Ember";


const { alias, and, bool } = computed;
const { service } = inject;

function switchProperty( key ) {
	return computed( "isLoading", "isSuccessful", function() {
		let property = get( this, "isLoading" )
			? `${key}Loading`
			: get( this, "isSuccessful" )
				? `${key}Success`
				: `${key}Failure`;
		return get( this, property );
	});
}


export default Mixin.create({
	auth : service(),
	store: service(),

	isVisible   : alias( "isValid" ),
	isValid     : and( "model", "auth.session.isLoggedIn" ),
	isSuccessful: bool( "record" ),

	model : null,
	record: null,
	id    : alias( "model.id" ),
	name  : alias( "id" ),

	isLoading: false,
	isLocked : false,

	_class  : switchProperty( "class" ),
	icon    : switchProperty( "icon" ),
	title   : switchProperty( "title" ),
	iconanim: true,
	spinner : true,

	classLoading: "btn-info",
	classSuccess: "btn-success",
	classFailure: "btn-danger",
	iconLoading : "fa-question",
	iconSuccess : "fa-check",
	iconFailure : "fa-times",
	titleLoading: "",
	titleSuccess: "",
	titleFailure: "",


	_checkRecord: observer( "isValid", "model", function() {
		const modelName = this.modelName;
		if ( !modelName ) { return; }

		if ( get( this, "isLoading" ) ) { return; }

		const isValid = get( this, "isValid" );
		const id      = get( this, "id" );
		const record  = get( this, "record" );
		if ( !isValid || !id || record !== null ) { return; }

		setProperties( this, {
			record   : null,
			isLoading: true,
			isLocked : true
		});

		const store = get( this, "store" );

		return store.findExistingRecord( modelName, id )
			.catch( () => false )
			.then( record => {
				if ( get( this, "isDestroyed" ) ) {
					return;
				}

				setProperties( this, {
					record,
					isLoading: false,
					isLocked : false
				});
			});
	}).on( "init" )
});
