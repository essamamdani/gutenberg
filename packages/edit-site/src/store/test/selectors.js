/**
 * WordPress dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import {
	isFeatureActive,
	getCanUserCreateMedia,
	getSettings,
	getHomeTemplateId,
	getEditedPostType,
	getEditedPostId,
	getPreviousEditedPostType,
	getPreviousEditedPostId,
	getPage,
	getNavigationPanelActiveMenu,
	getReusableBlocks,
	isNavigationOpened,
	isInserterOpened,
	isListViewOpened,
} from '../selectors';

describe( 'selectors', () => {
	const canUser = jest.fn( () => true );
	const getEntityRecords = jest.fn( () => [] );
	getCanUserCreateMedia.registry = {
		select: jest.fn( () => ( { canUser } ) ),
	};
	getReusableBlocks.registry = {
		select: jest.fn( () => ( { getEntityRecords } ) ),
	};

	describe( 'isFeatureActive', () => {
		it( 'is tolerant to an undefined features preference', () => {
			// See: https://github.com/WordPress/gutenberg/issues/14580
			const state = {
				preferences: {},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( false );
		} );

		it( 'should return true if feature is active', () => {
			const state = {
				preferences: {
					features: {
						chicken: true,
					},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( true );
		} );

		it( 'should return false if feature is not active', () => {
			const state = {
				preferences: {
					features: {
						chicken: false,
					},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( false );
		} );

		it( 'should return false if feature is not referred', () => {
			const state = {
				preferences: {
					features: {},
				},
			};

			expect( isFeatureActive( state, 'chicken' ) ).toBe( false );
		} );
	} );

	describe( 'getCanUserCreateMedia', () => {
		it( "selects `canUser( 'create', 'media' )` from the core store", () => {
			expect( getCanUserCreateMedia() ).toBe( true );
			expect(
				getCanUserCreateMedia.registry.select
			).toHaveBeenCalledWith( coreDataStore );
			expect( canUser ).toHaveBeenCalledWith( 'create', 'media' );
		} );
	} );

	describe( 'getReusableBlocks', () => {
		it( "selects `getEntityRecords( 'postType', 'wp_block' )` from the core store", () => {
			expect( getReusableBlocks() ).toEqual( [] );
			expect( getReusableBlocks.registry.select ).toHaveBeenCalledWith(
				coreDataStore
			);
			expect( getEntityRecords ).toHaveBeenCalledWith(
				'postType',
				'wp_block',
				{
					per_page: -1,
				}
			);
		} );
	} );

	describe( 'getSettings', () => {
		it( "returns the settings when the user can't create media", () => {
			canUser.mockReturnValueOnce( false );
			canUser.mockReturnValueOnce( false );
			const state = { settings: {}, preferences: {} };
			const setInserterOpened = () => {};
			expect( getSettings( state, setInserterOpened ) ).toEqual( {
				outlineMode: true,
				focusMode: false,
				hasFixedToolbar: false,
				__experimentalSetIsInserterOpened: setInserterOpened,
				__experimentalReusableBlocks: [],
			} );
		} );

		it( 'returns the extended settings when the user can create media', () => {
			const state = {
				settings: { key: 'value' },
				preferences: {
					features: {
						focusMode: true,
						fixedToolbar: true,
					},
				},
			};
			const setInserterOpened = () => {};

			expect( getSettings( state, setInserterOpened ) ).toEqual( {
				outlineMode: true,
				key: 'value',
				focusMode: true,
				hasFixedToolbar: true,
				__experimentalSetIsInserterOpened: setInserterOpened,
				__experimentalReusableBlocks: [],
				mediaUpload: expect.any( Function ),
			} );
		} );
	} );

	describe( 'getHomeTemplateId', () => {
		it( 'returns the home template ID', () => {
			const state = { homeTemplateId: {} };
			expect( getHomeTemplateId( state ) ).toBe( state.homeTemplateId );
		} );
	} );

	describe( 'getEditedPostId', () => {
		it( 'returns the template ID', () => {
			const state = { editedPost: [ { id: 10 } ] };
			expect( getEditedPostId( state ) ).toBe( 10 );
		} );
	} );

	describe( 'getEditedPostType', () => {
		it( 'returns the template type', () => {
			const state = { editedPost: [ { type: 'wp_template' } ] };
			expect( getEditedPostType( state ) ).toBe( 'wp_template' );
		} );
	} );

	describe( 'getPreviousEditedPostId', () => {
		it( 'returns the previous template ID', () => {
			const state = { editedPost: [ { id: 10 }, { id: 20 } ] };
			expect( getPreviousEditedPostId( state ) ).toBe( 10 );
		} );

		it( 'returns undefined when there are no previous pages', () => {
			const state = { editedPost: [ { id: 10 } ] };
			expect( getPreviousEditedPostId( state ) ).toBeUndefined();
		} );
	} );

	describe( 'getPreviousEditedPostType', () => {
		it( 'returns the previous template type', () => {
			const state = {
				editedPost: [
					{ type: 'wp_template' },
					{ type: 'wp_template_part' },
				],
			};
			expect( getPreviousEditedPostType( state ) ).toBe( 'wp_template' );
		} );

		it( 'returns undefined when there are no previous pages', () => {
			const state = { editedPost: [ { type: 'wp_template' } ] };
			expect( getPreviousEditedPostType( state ) ).toBeUndefined();
		} );
	} );

	describe( 'getPage', () => {
		it( 'returns the page object', () => {
			const page = {};
			const state = { editedPost: [ { page } ] };
			expect( getPage( state ) ).toBe( page );
		} );
	} );

	describe( 'getNavigationPanelActiveMenu', () => {
		it( 'returns the current navigation menu', () => {
			const state = {
				navigationPanel: { menu: 'test-menu', isOpen: false },
			};
			expect( getNavigationPanelActiveMenu( state ) ).toBe( 'test-menu' );
		} );
	} );

	describe( 'isNavigationOpened', () => {
		it( 'returns the navigation panel isOpened state', () => {
			const state = {
				navigationPanel: { menu: 'test-menu', isOpen: false },
			};
			expect( isNavigationOpened( state ) ).toBe( false );
			state.navigationPanel.isOpen = true;
			expect( isNavigationOpened( state ) ).toBe( true );
		} );
	} );

	describe( 'isInserterOpened', () => {
		it( 'returns the block inserter panel isOpened state', () => {
			const state = {
				blockInserterPanel: true,
			};
			expect( isInserterOpened( state ) ).toBe( true );
			state.blockInserterPanel = false;
			expect( isInserterOpened( state ) ).toBe( false );
		} );
	} );

	describe( 'isListViewOpened', () => {
		it( 'returns the list view panel isOpened state', () => {
			const state = {
				listViewPanel: true,
			};
			expect( isListViewOpened( state ) ).toBe( true );
			state.listViewPanel = false;
			expect( isListViewOpened( state ) ).toBe( false );
		} );
	} );
} );
