export default (config, env, helpers) => {
    let critters = helpers.getPluginsByName(config, 'Critters')[0]
    if(critters) {
        critters.plugin.options.preload = 'js'
    }
}
