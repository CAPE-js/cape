
var currentSearchResults = null;

var HomePage = Vue.component("home-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        data.settings = this.$root.defaultDatasetSettings;
        data.visible_filters = [];
        return data;
    },
    // runs every time the route changes
    beforeRouteEnter: function( to, from, next ) {
        next((vm)=>{ vm.onRouteUpdate(to); });
    },
    mounted: function() { 
        // triggered when the template dom is rendered the first time
        this.setVisibleFilters();
    },
    watch: {
        '$route': function(to, from) {
            // triggered when the fragment changes
            this.onRouteUpdate( to );
        },
        'settings.show_all_filters': function( to, from ) {
            this.setVisibleFilters();
        }
    },
    updated: function() {
        // enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    },
    methods: {
        onRouteUpdate: function(to) {
            // this is called when a route is updated including on page load.
            // when the route is updated, update the filters
            if( to.name=="browse" && to.params.field != null && to.params.value != null ) {
                this.settings.show_all_filters = false;
                this.resetFilters();
                this.browse= { field: to.params.field, value: to.params.value };
                this.settings.filters_by_id[ this.browse.field ].mode = "is";
                this.settings.filters_by_id[ this.browse.field ].term = this.browse.value;
            } else {
                this.browse = null;
            }
            this.setVisibleFilters();
        },
        setVisibleFilters: function() {
            this.visible_filters = [];
            for (var i = 0; i < this.settings.filters.length; i++) {
                var filter = this.settings.filters[i];
                if (( this.settings.show_all_filters 
                   || filter.field.quick_search 
                   || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    this.visible_filters.push( filter );
                }
            } 
        },
        activeFilters: function() {  
            // build a list of filters to be applied
            var active_filters = [];
            for (var i = 0; i < this.settings.filters.length; i++) {
                // does the filter pass?
                var filter = this.settings.filters[i];
                if (filter.isSet() && ( this.settings.show_all_filters 
                                     || filter.field.quick_search 
                                     || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    active_filters.push(filter);
                }
            }
            return active_filters;
        },
        filterResults: function() {
            var active_filters = this.activeFilters();

            // iterate over each record
            var records_to_show = [];
            for (var i = 0; i < this.dataset.records.length; i++) {
                var record = this.dataset.records[i];

                // iterate over each active filter
                var all_match = true;
                for (var j = 0; j < active_filters.length; j++) {
                    // does the filter pass?
                    var filter = active_filters[j];
                    if (!filter.matchesRecord(record)) {
                        all_match = false;
                        break;
                    }
                }

                // if all filters pass then add to array of matching records
                if (all_match) {
                    records_to_show.push(record);
                }
            }

            return records_to_show;
        },
        sortResults: function(results) {
            // sort records based on sort field
            var component = this;
            results.sort( function(a,b) {
                var aValue = a[component.settings.sort_field].value;
                var bValue = b[component.settings.sort_field].value;

		// if the value is a list of values, we sort by the first
                if(typeof aValue === 'array') { aValue = aValue[0]; }
                if(typeof bValue === 'array') { bValue = bValue[0]; }

		// null and empty values always sort last no matter the sort_dir
                if( aValue == null || aValue.trim() == "" ) { return 1; }
                if( bValue == null || bValue.trim() == "" ) { return -1; }

                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
                if( aValue==bValue ) { return 0; }
                if( component.settings.sort_dir == 'asc'  && aValue>bValue ) { return 1; }
                if( component.settings.sort_dir == 'desc' && aValue<bValue ) { return 1; }
                return -1;
            });
            return results;
        },
        resetFilters: function() {
            for (var i = 0; i < this.settings.filters.length; i++) {
                this.settings.filters[i].reset();
            }
        },
        ignoreEnter: function(e) { e.stopPropagation(); return true; }
    },
    computed: {
        // more efficient to have this as a computed as the results are cached
        filteredAndSortedResults: function() {
            var results = this.filterResults();
            results = this.sortResults(results);
            // argh, this is a side effect! It lets the record view know the prev and next result
            currentSearchResults = {};
            return results;
        },
        // show the results if either result_mode is "filter" (default is filter)
        // or else "search" mode only show results IF one or more filters is specified
        showResults: function() {  
            if( this.dataset.config["result_mode"] != "search" ) {
                // filter mode starts showing everything
                return true;
            }
            // search mode only shows results once they start typing
            var active_filters = this.activeFilters();
            return( active_filters.length > 0 );
        }
    },
    template: template
});

