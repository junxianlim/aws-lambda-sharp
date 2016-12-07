```
     ___   ____    __    ____   _______.    __          ___      .___  ___. .______    _______       ___
    /   \  \   \  /  \  /   /  /       |   |  |        /   \     |   \/   | |   _  \  |       \     /   \
   /  ^  \  \   \/    \/   /  |   (----`   |  |       /  ^  \    |  \  /  | |  |_)  | |  .--.  |   /  ^  \
  /  /_\  \  \            /    \   \       |  |      /  /_\  \   |  |\/|  | |   _  <  |  |  |  |  /  /_\  \
 /  _____  \  \    /\    / .----)   |      |  `----./  _____  \  |  |  |  | |  |_)  | |  '--'  | /  _____  \
/__/     \__\  \__/  \__/  |_______/       |_______/__/     \__\ |__|  |__| |______/  |_______/ /__/     \__\

               _______. __    __       ___      .______      .______
   _          /       ||  |  |  |     /   \     |   _  \     |   _  \
 _| |_       |   (----`|  |__|  |    /  ^  \    |  |_)  |    |  |_)  |
|_   _|       \   \    |   __   |   /  /_\  \   |      /     |   ___/
  |_|     .----)   |   |  |  |  |  /  _____  \  |  |\  \----.|  |
          |_______/    |__|  |__| /__/     \__\ | _| `._____|| _|

 __  .___  ___.      ___       _______  _______
|  | |   \/   |     /   \     /  _____||   ____|
|  | |  \  /  |    /  ^  \   |  |  __  |  |__
|  | |  |\/|  |   /  /_\  \  |  | |_ | |   __|
|  | |  |  |  |  /  _____  \ |  |__| | |  |____
|__| |__|  |__| /__/     \__\ \______| |_______|

.______   .______        ______     ______  _______     _______.     _______.  ______   .______
|   _  \  |   _  \      /  __  \   /      ||   ____|   /       |    /       | /  __  \  |   _  \
|  |_)  | |  |_)  |    |  |  |  | |  ,----'|  |__     |   (----`   |   (----`|  |  |  | |  |_)  |
|   ___/  |      /     |  |  |  | |  |     |   __|     \   \        \   \    |  |  |  | |      /
|  |      |  |\  \----.|  `--'  | |  `----.|  |____.----)   |   .----)   |   |  `--'  | |  |\  \----.
| _|      | _| `._____| \______/   \______||_______|_______/    |_______/     \______/  | _| `._____|

```

# AWS Lambda + Sharp Image Processor

## Setup:
  - Spin up a new AWS EC2 Micro Instance (free) and SSH into server - [Documentation](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
  - Install dependences:
    ```
    curl -s https://rpm.nodesource.com/setup_4.x | sudo bash -
    sudo yum install -y gcc-c++ nodejs
    ```
  - Clone Project and `npm i sharp async`.
  - Compress `node_modules` and `index.js` into a zip file.
    ```
    zip -ur9 aws-sharp.zip index.js node_modules
    ```
  - Download the zipped file into your local machine. (Type on your local terminal)
    ```
    scp -i your.pem your-ec2-instance:/home/ec2-user/aws-sharp.zip ~/your-local-folder
    ```
  - Spin up a new AWS lambda instance and select `configure trigger` option.
  - Select S3 and relevant bucket with the following options:
    - Event Type: Object Created (All)
    - Prefix: Your prefixed folder, default is set at `uploads/originals`
    - Tick `enable trigger`
  - Select `configure function` next.
    - Fill in `*` details.
    - Select Upload a .ZIP file and attach the downloaded zipped file.
    - Create a new role from template, name it and set permission to `S3 Object read-only permission`.
  - Confirm and test, you should be good to go!

## Options:
  - If you need to add more resizing variants, follow the format:
    ```
    var _half = {
      command: "scale",
      max_width: 0.5,
      max_height: 0.5,
      version: "large"
    }
    ```
  - Accepts 2 commands - `scale` or `fixed`:
    - `scale` shrinks the image by a percentage (decimal).
    - `fixed` just crops the image into the set size (pixels).

## References:
  - Original tutorial [here](https://medium.com/wolox-driving-innovation/image-processing-in-rails-using-aws-lambda-43b5b268019f#.1zgikak33)
  - Sharp's API [here](http://sharp.dimens.io/en/stable/api/).
  
## I'm not the greatest at programming, if you can refactor, offer criticism, or improve on the code, let me know! : )
