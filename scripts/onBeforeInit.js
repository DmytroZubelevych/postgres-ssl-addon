var resp = jelastic.env.control.GetEnvs();
if (resp.result !== 0) return resp;
var envs = [];
var nodes = {};
var stackVersion;
var nodeMajorVersion;

for (var i = 0, envInfo, env; envInfo = resp.infos[i]; i++) {
  env = envInfo.env;

  if (env.status == 1) {
    for (var j = 0, node; node = envInfo.nodes[j]; j++) {
      nodes[env.envName] = nodes[env.envName] || [];
      nodes[env.envName].groups = nodes[env.envName].groups || {};

      var stackVersion = node.version;
      var nodeMajorVersion = stackVersion.split(".")[0];

      if ((node.nodeType == "postgresql" && nodeMajorVersion > 10) || node.nodeType == "pgpool2") {
        if (!nodes[env.envName].groups[node.nodeGroup]) {
          nodes[env.envName].push({
            value: node.nodeGroup,
            caption: node.name + ' (' + node.nodeGroup + ')'
          }); 
        }
      }
 
      nodes[env.envName].groups[node.nodeGroup] = true;
    }

    if (nodes[env.envName] && nodes[env.envName].length > 0) {
      envs.push({
        value: env.envName,
        caption: (env.displayName || env.envName)
      });
    }
  }
}

if (envs.length > 0) {
  jps.settings.fields[0].values = envs;
  jps.settings.fields[0].value = envs[0].value;
  jps.settings.fields[1].dependsOn.envName = nodes;
}

return { result: 0, settings: jps.settings };
