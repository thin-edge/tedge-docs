---
title: Building an image
tags: [Extend, Build]
sidebar_position: 3
---

This guide walks you through building a custom image using [Rugpi](https://github.com/silitics/rugpi). Rugpi is an open source tool to build images with support for robust Over-the-Air (OTA) updates. Currently it only supports Raspberry Pi devices, however in the future more device types may be considered.

Rugpi is very beginner friendly compared to The Yocto Project, and has much shorter build times since it works by extending the official Raspberry Pi images with custom recipes which either install or configure components in the image, rather than rebuilding everything from scratch. Building an image with custom recipes only takes about 10 mins compared with the > 4 hours using The Yocto Project.

The instructions on this page can be used to build images for the following devices:

* Raspberry Pi 1 (32 bit)
* Raspberry Pi 2 (64 bit)
* Raspberry Pi 3 (64 bit)
* Raspberry Pi 4 / 400 (64 bit)
* Raspberry Pi Compute Module 4 (64 bit)
* Raspberry Pi 5 (64 bit)
* Raspberry Pi Zero W (32 bit)
* Raspberry Pi Zero 2W (64 bit)

Please check out the [official Rugpi documentation](https://oss.silitics.com/rugpi/) for more details on how to use and customize it.

## Setting up your build system

Building images using Rugpi is considerably faster and easier when compared to The Yocto Project, so it makes it a great tool for beginners.

The following tools are required to build an image:

* Docker Engine

:::tip
Images can be built using Rugpi using a CI Workflow. An example for a Github Workflow is included in the template project.
:::

## Building your image

The [tedge-rugpi-images](https://github.com/thin-edge/tedge-rugpi-image) project includes out of the box configurations to perform robust Over-the-Air Operating System updates.

The [tedge-rugpi-core](https://github.com/thin-edge/tedge-rugpi-core) project contains the %%te%% specific recipes which are used to build the image.

Feel free to clone the project if you want to make your own customizations, however please always refer back to the project if you run into any problems (as it may have changed in the meantime).

### Pre-requisites

To run the project tasks, you will need to install a command line tool called [just](https://just.systems/man/en/chapter_5.html).

You can install just using on of the following commands:

```sh tab={"label":"homebrew"}
brew install just
```

```sh tab={"label":"cargo"}
cargo install just
```

```sh tab={"label":"script"}
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sudo bash -s -- --to /usr/bin
```

For other installation possibilities check out the [just documentation](https://just.systems/man/en/chapter_4.html).

### Cloning the project {#clone-project}

1. Clone the project and change directory to the locally checked out folder

    ```sh
    git clone https://github.com/thin-edge/tedge-rugpi-image.git
    cd tedge-rugpi-image
    ```

2. Create a custom `.env` file which will be used to store secrets

    ```sh
    cp env.template .env
    ```

    The `.env` file will not be committed to the repo

3. Add your public ssh key to the `.env` file

    Adding public SSH keys to the project will allow you to access after the image is flashed to the device (which is critical for the onboarding process). The SSH keys are provided in the form of environment variables where the variable names start with `SSH_KEY_<description>` and are added to the authorized keys for the root user, e.g. `/root/.ssh/authorized_keys`.

    For example:

    ```
    SSH_KEYS_bootstrap="ssh-rsa xxxxxxx"
    ```

    :::tip
    This step is critical as it will enable you to connect via SSH to your device to perform tasks such as onboarding! If you don't set your ssh public key in the authorized keys, you then need to connect your device to a monitor/display and keyboard in order to perform the onboarding.
    :::

4. Optional: Add Wifi ssid/password

    If your device does not have an ethernet adapter, or if you want to connect the device to a Wifi network for onboarding, then you will have to add the Wifi credentials to the `.env` file.

    Below shows the environment variables that should be added to the `.env` file.

    ```sh
    SECRETS_WIFI_SSID=example
    SECRETS_WIFI_PASSWORD=yoursecurepassword
    ```

    :::tip
    The Wifi credentials only need to be included in the image that is flashed to the SD card. Subsequent images don't need to include the Wifi credentials, as the network connection configuration files are persisted across images.

    If an image has Wifi credentials baked in, then you should not make this image public, as it would expose your credentials! 
    :::


### Building an image

Building an image will produce a `.xz` file which can be flashed to an SD card (or device). Afterwards your device will be able to apply the same type of image via OTA updates.

Images can be built in MacOS or Linux environments (including WSL 2), however if you have problems building the image, then you can build the images using the Github workflow after forking the project.


1. Build an image for your device (machine)

    ```sh tab={"label":"Pi\tZero"}
    just build-pizero
    ```

    ```sh tab={"label":"Pi\t1"}
    just build-pi1
    ```    

    ```sh tab={"label":"Pi\t2"}
    just build-pi2
    ```
    ```sh tab={"label":"Pi\t3"}
    just build-pi3
    ```
    ```sh tab={"label":"Pi\tZero2W"}
    just build-pizero2w
    ```

    ```sh tab={"label":"Pi\t4\t(With\tFirmware)"}
    just build-pi4-include-firmware
    ```

    ```sh tab={"label":"Pi\t4\t(Without\tFirmware)"}
    just build-pi4
    ```

    ```sh tab={"label":"Pi\t5"}
    just build-pi5
    ```

    :::note
    See the [tips](#raspberry-pi-4-image-selection) for helping you select which Raspberry Pi 4 image is suitable for you (e.g. with or without the EEPROM firmware update)
    :::

2. Flash the base image using the instructions on the [Flashing an image](../../flashing-an-image.md) page


:::info
The above tasks are actually just user-friendly helpers to make it easier to select the right image for your device, so some build-xxx tasks actually build the same output image (e.g. `build-pi4` and `build-pi5` produce the same image).

If you want more control over the process you can use the command, and select one of the images as defined in the [rugpi-bakery.toml](https://github.com/thin-edge/tedge-rugpi-image/blob/main/rugpi-bakery.toml)

For more information about Rugpi repositories, layers and overall concepts please read the [official Rugpi documentation](https://oss.silitics.com/rugpi/docs/guide/system-customization/).
:::


## Tips

This section contains general tips which can be helpful whilst either getting things setup, or what to do when you encounter an error.

### Building on MacOS Apple Silicon

If you receive the following error during the build process, then it indicates that your current docker setup needs to be adjusted:

```sh
fallocate: fallocate failed: Operation not supported
```

On MacOS, there are a few solutions which provide the docker engine for us within MacOS, some known solutions are:

* Docker Desktop
* Rancher Desktop
* colima

Generally all of the above solutions require creating some kind of Virtual Machine (vm), however it is important that the virtual machine uses `virtiofs` (not `sshfs`) for managing the shared disks. Most of the above solutions should work out-of-the-box, however check below for any solution-specific instructions.

#### colima

Earlier [colima](https://github.com/abiosoft/colima) versions use `qemu` as the default vm-type, however this type uses `sshfs` to manage the VMs shared disk. Newer versions will use `vz` and `virtiofs` by default, however you will have to delete your existing colima instance, and recreate it opting into the `vz` vm-type.

For example, you can remove any existing instance, and create an instance which uses `vz` instead of `qemu`:

```sh
colima delete
colima start --vm-type=vz
```

After starting colima, you can verify the "mountType" (disk type) by checking the `colima status`:

```sh
colima status 
```

```text title="Output"
INFO[0000] colima is running using macOS Virtualization.Framework 
INFO[0000] arch: aarch64                                
INFO[0000] runtime: docker                              
INFO[0000] mountType: virtiofs                          
INFO[0000] socket: unix:///Users/johnsmith/.colima/default/docker.sock
```

### Raspberry Pi 4 image selection

Raspberry Pi 4 devices need to have their (EEPROM) firmware updated before the OTA updates can be issued. This is because the initial Raspberry Pi 4's were released without the [tryboot feature](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#fail-safe-os-updates-tryboot). The tryboot feature is used by Rugpi to provide the reliable partition switching between the A/B partitions. Raspberry Pi 5's have support for tryboot out of the box, so they do not require a EEPROM upgrade.

You can build an image which includes the required EEPROM firmware to enable the tryboot feature, however this image can only be used to deploy to Raspberry Pi 4 devices (not Raspberry Pi 5!)

```sh
just build-pi4-include-firmware
```

After the above image has been flashed to the device once, you can switch back to the image without the EEPROM firmware so that the same image can be used for both Raspberry Pi 4 and 5.

```sh
just build-pi4

# or
just build-pi5
```
