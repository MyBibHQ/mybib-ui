<template>
  <div class="projects">
    <button class="new-project-btn" @click="createNewProject">
      <span style="align-items:center; display:flex;">
        <span style="align-items:center; display:flex; flex-grow:1;">
          <i class="material-icons">add</i> Start new project
        </span>
        <mu-circular-progress v-if="isLoading" :size="26" color="#d8d8d8" :strokeWidth="2"/>
      </span>
    </button>
    <div ref="projectRows">
      <div v-for="directoryEntry in directoryEntries" :key="directoryEntry.name || directoryEntry.project.id">
        <ProjectsRow v-if="directoryEntry.type === 'project'" :ref="'project_' + directoryEntry.project.id" :project="directoryEntry.project" :isSelected="selectedProject && selectedProject === directoryEntry.project" @onMoveProject="onMoveProject" @onCreateFolder="onCreateFolder" @onMoveFolder="onMoveFolder"/>
        <ProjectsFolder v-if="directoryEntry.type === 'folder'" :ref="'folder_' + directoryEntry.name" :name="directoryEntry.name" :projects="directoryEntry.projects" @onRenameFolder="onRenameFolder" @onUngroupFolder="onUngroupFolder(directoryEntry)" @onMoveProject="onMoveProject">
          <ProjectsRow v-for="project in directoryEntry.projects" :key="project.id" :ref="'project_' + project.id" :project="project" :folder="true" :isSelected="selectedProject && selectedProject === project" @onDelete="deleteProject(project)" @onMoveProject="onMoveProject" @onCreateFolder="onCreateFolder" />
        </ProjectsFolder>
      </div>
    </div>
  
    <TooltipLg v-if="selectedProject && selectedProject.references.length > 0" tooltipId="projects" category="intro" placement="bottom" :target="tooltipTarget">
      <p>📝 Start new bibliographies and switch between them over here. You can delete, rename, reorder, and duplicate them too.</p>
      <p>📁 You can group your projects together into folders by dragging one on top of the other.</p>
    </TooltipLg>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import Config from '@/config.js';

import SnackBar from '@/services/snackBar.js';

import ProjectsFolder from '@/components/ProjectsFolder';
import ProjectsRow from '@/components/ProjectsRow';
import TooltipLg from '@/components/TooltipLg';

export default {
  name: 'Projects',
  components: {
    ProjectsFolder,
    ProjectsRow,
    TooltipLg
  },
  data () {
    return {
      isLoading: false,
      tooltipTarget: null
    };
  },
  computed: {
    user () {
      return this.$store.getters.user;
    },
    directoryEntries () {
      const directoryTree = [];
      for (let i = 0; i < this.user.projects.length; i++) {
        const project = this.user.projects[i];
        if (project.folderName) {
          const folder = {
            type: 'folder',
            name: project.folderName,
            projects: [project]
          };
          // now check the next project to see if anymore need to go in here
          while (this.user.projects[i + 1] && this.user.projects[i + 1].folderName === project.folderName) {
            folder.projects.push(this.user.projects[i + 1]);
            i++;
          }
          directoryTree.push(folder);
        } else {
          // no folder, just add
          directoryTree.push({type: 'project', project: project});
        }
      }
      return directoryTree;
    },
    selectedProject () {
      return this.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    }
  },
  watch: {
    '$route.params.projectId' (val) {
      if (val) {
        // only save this if the val is set
        Cookies.set(Config.cookiePrefixString + '-lastSelectedProject', val, { expires: 730 });
      }
    }
  },
  methods: {
    checkSelectedProjectExists () {
      // if there's a project id but no selectedProject object it means the user doesn't have the project they're asking for
      if (this.$route.params.projectId && !this.selectedProject) {
        // check for the last selected project id
        const lastSelectedProjectId = parseInt(Cookies.get(Config.cookiePrefixString + '-lastSelectedProject'));
        if (lastSelectedProjectId && this.user.projects.some((p) => {
          return p.id === lastSelectedProjectId;
        })) {
          this.$router.push({ name: 'Project', params: { projectId: lastSelectedProjectId } });
        } else if (this.user.projects[0]) {
          this.$router.push({ name: 'Project', params: { projectId: this.user.projects[0].id } });
        } else {
          this.$router.push({ name: 'Root' });
        }
      }
    },
    async createNewProject () {
      this.isLoading = true;
      const newProject = await this.user.addProject({ title: 'New project name' });
      this.isLoading = false;
      this.$nextTick(() => {
        this.$refs['project_' + newProject.id][0].renameProject();
      });
      this.$router.push({ name: 'Project', params: {projectId: newProject.id} });
    },
    onMoveProject (projectIdToMove, project, direction) {
      const projectToMove = this.user.projects.find((p) => {
        return p.id === projectIdToMove;
      })
      projectToMove.folderName = project.folderName; // this will auto add or remove the project to/from a project
      projectToMove.save();
      this.user.projects.splice(this.user.projects.indexOf(projectToMove), 1)[0];
      this.user.projects.splice(this.user.projects.indexOf(project) + direction, 0, projectToMove);
      this.user.saveProjectOrder();
    },
    onCreateFolder (projectIdToMove, project) {
      const projectToMove = this.user.projects.find((p) => {
        return p.id === projectIdToMove;
      })
      // find the first available new folder name
      let proposedNewFolderTitle = 'New folder';
      if (this.user.projects.some(p => {
        return p.folderName === proposedNewFolderTitle
      })) {
        // A folder already exists with the default name. Cycle through numbers to find one that isn't taken
        for (let i = 1; true; i++) {
          proposedNewFolderTitle = `New folder ${i}`;
          if (!this.user.projects.some(p => {
            return p.folderName === proposedNewFolderTitle
          })) break;
        }
      }

      projectToMove.folderName = proposedNewFolderTitle;
      project.folderName = proposedNewFolderTitle;

      projectToMove.save();
      project.save();

      this.user.projects.splice(this.user.projects.indexOf(projectToMove), 1)[0];
      this.user.projects.splice(this.user.projects.indexOf(project) + 1, 0, projectToMove);
      this.user.saveProjectOrder();

      this.$nextTick(() => {
        this.$refs['folder_' + proposedNewFolderTitle][0].renameFolder();
        this.$refs['folder_' + proposedNewFolderTitle][0].isOpen = true;
      })
    },
    onRenameFolder (oldName, newName) {
      // check that there isn't already a folder with that name
      if (this.user.projects.some(p => {
        return p.folderName === newName
      })) {
        SnackBar.addSnack({message: '⛔ A folder with that name already exists. Please choose a different name.'});
        return;
      }
      const folderIsOpen = this.$refs['folder_' + oldName][0].isOpen;
      const projectsToUpdate = this.user.projects.filter((p) => {
        return p.folderName === oldName;
      })
      projectsToUpdate.forEach((project) => {
        project.folderName = newName;
        project.save();
      });
      this.$nextTick(() => {
        this.$refs['folder_' + newName][0].isOpen = folderIsOpen;
      })
    },
    onUngroupFolder (directoryEntry) {
      directoryEntry.projects.forEach(p => {
        p.folderName = null;
        p.save();
      })
    },
    onMoveFolder (folderName, projectToMoveTo, direction) {
      const projectsToMove = this.user.projects.filter((p) => {
        return p.folderName === folderName;
      })
      if (direction === 1) {
        // this prevents the order flipping
        projectsToMove.reverse();
      }
      projectsToMove.forEach(p => {
        this.user.projects.splice(this.user.projects.indexOf(p), 1)[0];
        this.user.projects.splice(this.user.projects.indexOf(projectToMoveTo) + direction, 0, p);
      })

      this.user.saveProjectOrder();
    }
  },
  created () {
    this.checkSelectedProjectExists();
  },
  mounted () {
    this.$nextTick(() => {
      this.tooltipTarget = this.$refs.projectRows;
    })
  },
  updated () {
    this.checkSelectedProjectExists();
  }
}
</script>

<style lang="scss">
  .projects { background:#F5F7F9; bottom:0; left:0; overflow-y:auto; overflow-x:hidden; position:absolute; padding:20px 20px 46px 0; top:0; width:304px;
    .new-project-btn { border-radius:0 30px 30px 0; height:53px; margin-bottom:3px; padding:0 10px 0 12px; width:100%; z-index:2;
      i { margin:0 17px 0 0; }
      &:hover { background: rgba(0,0,0,0.04);}
    }

    &::-webkit-scrollbar-track { margin:10px 0; }
  }
</style>