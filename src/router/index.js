import {createWebHistory, createRouter} from "vue-router";
import Home from "@/views/Home.vue";
import Editor from "@/views/Editor.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home
	},
	{
		path: "/Editor",
		name: "Editor",
		component: Editor,
		props: true
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;