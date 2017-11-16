import {Component} from '@angular/core';
import {Config, NavController} from 'ionic-angular';
import {RecipeService} from '../../providers/recipe-service-rest';
import {RecipeDetailPage} from '../recipe-detail/recipe-detail';
import leaflet from 'leaflet';

@Component({
    selector: 'page-recipe-list',
    templateUrl: 'recipe-list.html'
})
export class RecipeListPage {

    recipes: Array<any>;
    recipesForSearch: Array<any>;
    searchKey: string = "";
    viewMode: string = "list";
    map;
    markersGroup;

    constructor(public navCtrl: NavController, public service: RecipeService, public config: Config) {
        this.findAll();
    }

    openRecipeDetail(recipe: any) {
        this.navCtrl.push(RecipeDetailPage, recipe);
    }

    onInput(event) {
         // Reset items back to all of the items
        this.recipes = this.recipesForSearch;

        // set val to the value of the searchbar
        let val = this.searchKey;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
          this.recipes = this.recipes.filter((recipe) => {
            return (recipe.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
        }
    }

    onCancel(event) {
        this.findAll();
    }

    findAll() {
        this.service.findAll()
            .then(data => {
                this.recipes = data;
                this.recipesForSearch = data;
            })
            .catch(error => alert(error));
    }

    recipeMap() {
        setTimeout(() => {
            this.map = leaflet.map("map").setView([48.85, 2.35], 10);
            leaflet.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(this.map);
            this.recipeMarkers();
        })
    }

    recipeMarkers() {
        if (this.markersGroup) {
            this.map.removeLayer(this.markersGroup);
        }
        this.markersGroup = leaflet.layerGroup([]);
        this.recipes.forEach(recipe => {
            if (recipe.lat, recipe.lng) {
                let marker: any = leaflet.marker([recipe.lat, recipe.lng]).on('click', event => this.openRecipeDetail(event.target.data));
                marker.data = recipe;
                this.markersGroup.addLayer(marker);
            }
        });
        this.map.addLayer(this.markersGroup);
    }

}
