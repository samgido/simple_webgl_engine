package main

import (
	"fmt"
	"os"
	"path/filepath"

	"encoding/json"

	"github.com/evanw/esbuild/pkg/api"
)

type ShaderLocation struct {
	ShaderName string `json:"name"`
}

func main() {
	shader_files := []ShaderLocation{}

	entries, err := os.ReadDir("./web/dist/shaders")
	if err != nil {
		fmt.Println("Error reading shaders directory")
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()

		if filepath.Ext(name) != ".frag" {
			continue
		}

		shader_files = append(shader_files, ShaderLocation{
			ShaderName: name,
		})
	}

	serialized_shader_locations, err2 := json.Marshal(shader_files)
	if err2 != nil {
		fmt.Println("Error serializing shader locations")
	}

	err3 := os.WriteFile("web/dist/shaders/info.json", serialized_shader_locations, 0666)
	if err3 != nil {
		fmt.Println("Could not write shader locs to info.json")
	}

	serveWeb()
}

func serveWeb() {
	build_options := api.BuildOptions{
		EntryPoints: []string{"web/src/main.ts"},
		Outdir:      "web/dist",
		Bundle:      true,

		Loader: map[string]api.Loader{
			".frag": api.LoaderText,
			".vert": api.LoaderText,
		},
	}

	build_result := api.Build(build_options)
	if len(build_result.Errors) > 0 {
		fmt.Println("Build failed")
		os.Exit(1)
	}

	ctx, err := api.Context(build_options)
	if err != nil {
		fmt.Println("Failed to get context")
		os.Exit(1)
	}

	_, err2 := ctx.Serve(api.ServeOptions{
		Servedir: "web/dist",
		Port:     3000,
	})
	if err2 != nil {
		fmt.Println("Failed to serve")
		os.Exit(1)
	}

	<-make(chan struct{})
}
