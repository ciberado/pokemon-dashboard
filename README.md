# Pokemon dashboard

This application tries to visualize in an attractive way the number of virtual machines created in a VMSS. It is designed to work in colaboration with [Azure Demo branch of the Pokemon application](https://github.com/ciberado/pokemon-nodejs/tree/azure-demo): every 15 seconds each instance running the pokemon application will put a message in a *storage account queue* named `healthbeats`. The dashboard will read those messages and show a miniature of the Pokémon corresponding to each virtual machine.

