### Basic Usage

Add files `client.yml` and `server.yml` in `config/`, and `.env`, then run

```
docker-compose up
```

A default admin account is created on first launch with credentials `admin:admin`. Make sure to log in and change this via the web interface or using the `/api/changepassword` endpoint.

#### Deploying Challenges

For now, there is no web interface to deploy challenges. Challenges are uploaded to the server via the `/admin/addChalls` endpoint as a gzipped tarball. Take a look at `example-challs/` for an example. The challenges directory should be laid out as follows:

```
challenges
├── crypto
│  ├── easy-crypto
│  │  └── challenge.yml
│  ├── hard-crypto
│  │  └── challenge.yml
├── osint
│  └── osint-who
│     ├── challenge.yml
│     └── hint.txt
├── pwn
│  └── easy-pwn
│     ├── challenge.yml
│     └── easypwn
└── steganography
   └── easy-stego
      └── challenge.yml
```

The `challenge` directory contains only subdirectories which are the names of the categories. Each category contains further subdirectories which contain the details of the challenge. Each challenge directory should contain a `challenge.yml` file which contains the metadata of the challenge. Files can also exist within this directory and included in the `files` key in the challenge config file to indicate that that file is to be provided to the user.

To deploy (using httpie):

```
$ tar cz challenges/ -f challs.tgz
$ http -f POST http://ctf.example.com/admin/addChalls 'Authorization: Bearer eyJ...' data@challs.tgz
```
