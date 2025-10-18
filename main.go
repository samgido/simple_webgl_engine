package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"slices"

	"encoding/json"

	"github.com/evanw/esbuild/pkg/api"

	"strconv"
)

type ResourceInfo struct {
	FragmentShaderFilesInfo []FileInfo `json:"fragmentShaderFilesInfo"`
	TextureFilesInfo        []FileInfo `json:"textureFilesInfo"`
}

type FileInfo struct {
	FileName string `json:"fileName"`
}

func main() {
	go watchAndBuild()

	port, parse_err := strconv.ParseInt(os.Args[1], 0, 64)
	if parse_err != nil {
		fmt.Printf("Error parsing input: %v\n", parse_err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/resource_info", handleGetResourceInfo)

	static := http.FileServer(http.Dir("./web/dist"))
	mux.Handle("/", static)

	if err := http.ListenAndServe(":"+strconv.Itoa(int(port)), mux); err != nil {
		fmt.Printf("Serving failed: %v\n", err)
	}
}

func handleGetResourceInfo(w http.ResponseWriter, r *http.Request) {
	frag_exts := []string{
		".frag",
	}

	texture_exts := []string{
		".jpg",
	}

	fragment_shader_files_info, get_frags_err := getFilesInfoByExt("./web/dist/shaders", frag_exts)
	if get_frags_err != nil {
		fmt.Printf("Failed to get fragment shader files info: %v\n", get_frags_err)
	}

	texture_files_info, get_texs_err := getFilesInfoByExt("./web/dist/resources/textures", texture_exts)
	if get_texs_err != nil {
		fmt.Printf("Failed to get texture files info: %v\n", get_texs_err)
	}

	w.Header().Set("Content-Type", "application/json")

	resourceInfo := ResourceInfo{
		FragmentShaderFilesInfo: fragment_shader_files_info,
		TextureFilesInfo:        texture_files_info,
	}

	if encode_err := json.NewEncoder(w).Encode(resourceInfo); encode_err != nil {
		http.Error(w, "Failed to serialize response", http.StatusInternalServerError)
	}
}

func getFilesInfoByExt(shaders_path string, exts []string) ([]FileInfo, error) {
	files := []FileInfo{}

	entries, read_dir_err := os.ReadDir(shaders_path)
	if read_dir_err != nil {
		return files, read_dir_err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()

		if !slices.Contains(exts, filepath.Ext(name)) {
			continue
		}

		files = append(files, FileInfo{
			FileName: name,
		})
	}

	return files, nil
}

func watchAndBuild() {
	build_options := api.BuildOptions{
		EntryPoints: []string{"web/src/main.ts"},
		Bundle:      true,
		Outfile:     "web/dist/main.js",
		Loader: map[string]api.Loader{
			".frag": api.LoaderText,
			".vert": api.LoaderText,
		},
		Write: true,
	}

	ctx, err := api.Context(build_options)
	if err != nil {
		fmt.Printf("Context error: %v\n", err)
	}
	defer ctx.Dispose()

	result := ctx.Rebuild()
	if len(result.Errors) > 0 {
		fmt.Printf("Build errors: %v\n", result.Errors)
	}

	if err2 := ctx.Watch(api.WatchOptions{}); err2 != nil {
		fmt.Printf("Watch error: %v\n", err2)
	}

	select {}
}
