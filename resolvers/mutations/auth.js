/**
 * Mutation resolvers — auth.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  LOGO_BASE64,
  TOKEN_EXPIRES_IN,
  bcrypt,
  conn,
  createToken,
  createTokenWithFP,
  createVendorToken,
  createVendorTokenWithFP,
  fs,
  hbs,
  inlineBase64,
  mongoose,
  path,
} = require("./_shared");

module.exports = {
  signupResident: async (
    _,
    { email, password, postalCode, firstName, lastName, initialLat, initialLng },
    { Resident, Pet, transporter }
  ) => {
    const indexE = email.indexOf("@");
    const indexD = email.indexOf(".");
    const residentName =
      email.slice(0, indexE) + email.slice(indexE + 1, indexD);
    const pet = await Pet.findOne({
      petName: "Dog_Jason",
    });
    // console.log(pet);
    const newResident = await new Resident({
      email,
      password,
      postalCode,
      firstName,
      lastName,
      residentName,
      initialLat,
      initialLng,
      pet: pet._id,
      location: { type: 'Point', coordinates: [initialLng, initialLat] }
    }).save();
    // console.log(email);
    // const token = createToken(newResident, process.env.SECRET, "2hr");
    const emailToken = email + "-Resident";
    const url = `http://localhost:4000/${emailToken}`;

    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./views/",
        layoutsDir: "./views/",
        defaultLayout: "passVerification",
      },
      viewPath: "./views/",
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));
    transporter.use(
      "compile",
      inlineBase64({
        cidPrefix: "somePrefix_",
      })
    );

    // console.log(newResident.residentName);

    const mailOptions = {
      to: email,
      subject: "Confirm Email - don't reply ",
      template: "passVerification",
      context: {
        url,
        base64: LOGO_BASE64,
        name: firstName + ' ' + lastName,
        isResident: true
      },
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    return {
      // token,
      emailSent: true,
    };
  },

  signupVendor: async (
    _,
    {
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessEmail,
      businessHours,
      logo,
      photoList,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      lat,
      lng
    },
    { Vendor, transporter }
  ) => {
    // console.log(email);
    // const newVendor = 
    // console.log(businessPhotos);

   const newVendor = await new Vendor({
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessEmail,
      businessHours,
      logo,
      photoList,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      lat,
      lng
    }).save();
    // console.log(businessPhone);
    // console.log(newVendor)
    // const token = createToken(newResident, process.env.SECRET, "2hr");
    // const dir = `./public/${businessTitle}/`;
    // let updatedPicFiles = [];
    
    // if(!fs.existsSync(dir)) {
    //    fs.mkdirSync(dir, { recursive: true });
    // }
    // if (businessPhotos.length > 0) {
    //   businessPhotos.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       businessTitle + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           // console.log(updatedPicFiles);
    //           await Vendor.findOneAndUpdate(
    //             { email },
    //             { $set: { photoList: updatedPicFiles } },
    //             { new: true }
    //           );
    //           resolve();
    //         });
    //     });

    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //   });

    //   // fs.readdir(dir, (err, files) => {
    //   //   if (err) throw err;
    //   //   console.log(files);
    //   //   updatedPicFiles = files;
    //   // });
    // }

    // console.log("updatedPicFiles" + updatedPicFiles);

    // console.log(businessPhone);
    const emailToken = email + "-Vendor";
    const url = `http://localhost:4000/${emailToken}`;

    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./views/",
        layoutsDir: "./views/",
        defaultLayout: "passVerification",
      },
      viewPath: "./views/",
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));
    transporter.use(
      "compile",
      inlineBase64({
        cidPrefix: "somePrefix_",
      })
    );

    // console.log(newResident.residentName)

    const mailOptions = {
      to: email,
      subject: "Confirm Email - don't reply ",
      // html: `<div>Please click this email to confirm your email: <a href="${url}"><button type="button">Confirm</button></a>
      //     <div>
      //       <p>This is the very good email</p>
      //       <img src="data:image/png;base64,${process.env.LOGO_BASE64}" width="30" height="30">
      //     </div>
      //     </div>`
      // attachments: [{
      //   filename: 'logo.png',
      //   path: '/cybertown/cybertown/src/assets/images/logo.png',
      //   cid: 'cybertownLogo'
      // }]
      template: "passVerification",
      context: {
        url,
        base64: LOGO_BASE64,
        name: newVendor.businessTitle,
        isResident: false
      },
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    return {
      // token,
      emailSent: true,
    };
  },

  signinResident: async (_, { email, password, fingerPrint }, { Resident }) => {
    const resident = await Resident.findOne({
      email,
    });
    // console.log(resident);
    if (!resident || !resident.emailVerified) {
      throw new Error("User not found / Email not verified ");
    } else {
      const isValidPassword = await bcrypt.compare(password, resident.password);
      if (!isValidPassword) {
        throw new Error("Invalid Password");
      }
      if (fingerPrint) {
        await Resident.findOneAndUpdate(
          {
            email,
          },
          {
            $set: {
              savedFingerPrint: fingerPrint,
            },
          }
        );
      }
     

      const token = fingerPrint
        ? createTokenWithFP(resident, process.env.SECRET)
        : createToken(resident, process.env.SECRET, TOKEN_EXPIRES_IN);
      // console.log(token);
      return {
        token,
        confirmed: resident.emailVerified,
      };
    }
  },

  signinVendor: async (_, { email, password, fingerPrint }, { Vendor }) => {
    const vendor = await Vendor.findOne({
      email,
    });
    // console.log(resident)
    if (!vendor || !vendor.emailVerified) {
      throw new Error("Vendor not found/Email verification not done yet");
    } else {
      const isValidPassword = await bcrypt.compare(password, vendor.password);
      if (!isValidPassword) {
        throw new Error("Invalid Password");
      }
      await Vendor.findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            savedFingerPrint: fingerPrint,
          },
        }
      );
      const token = fingerPrint
        ? createVendorTokenWithFP(vendor, process.env.SECRET)
        : createVendorToken(vendor, process.env.SECRET, TOKEN_EXPIRES_IN);
      // console.log(token)
      return {
        token,
        confirmed: vendor.emailVerified,
      };
    }
  },
};
